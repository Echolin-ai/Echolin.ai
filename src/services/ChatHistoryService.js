import { supabase } from '../config/supabase';

class ChatHistoryService {
  constructor() {
    this.currentSession = null;
  }

  // Create a new chat session
  async createSession(userId, title = null) {
    try {
      const sessionTitle = title || this.generateSessionTitle();
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: userId,
            title: sessionTitle,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      this.currentSession = data;
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Save a message to the current session
  async saveMessage(sessionId, type, content, metadata = null) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            type: type,
            content: content,
            metadata: metadata,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update session's updated_at timestamp
      await this.updateSessionTimestamp(sessionId);

      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Save multiple messages in a batch
  async saveMessages(sessionId, messages) {
    try {
      const messagesToInsert = messages.map(msg => ({
        session_id: sessionId,
        type: msg.type,
        content: msg.content,
        metadata: msg.metadata || null,
        created_at: msg.timestamp ? msg.timestamp.toISOString() : new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messagesToInsert)
        .select();

      if (error) throw error;

      // Update session's updated_at timestamp
      await this.updateSessionTimestamp(sessionId);

      return data;
    } catch (error) {
      console.error('Error saving messages:', error);
      throw error;
    }
  }

  // Update session timestamp
  async updateSessionTimestamp(sessionId) {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session timestamp:', error);
    }
  }

  // Get or create a session for the user
  async getOrCreateSession(userId) {
    try {
      if (this.currentSession) {
        return this.currentSession;
      }

      // Check if user has any recent sessions (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: recentSessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('updated_at', oneHourAgo)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (recentSessions && recentSessions.length > 0) {
        this.currentSession = recentSessions[0];
        return this.currentSession;
      }

      // Create new session if no recent session found
      return await this.createSession(userId);
    } catch (error) {
      console.error('Error getting or creating session:', error);
      throw error;
    }
  }

  // Generate a session title based on timestamp
  generateSessionTitle() {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `Chat Session - ${date} ${time}`;
  }

  // Auto-save a message if user is logged in
  async autoSaveMessage(userId, type, content, metadata = null) {
    if (!userId) return null;

    try {
      const session = await this.getOrCreateSession(userId);
      return await this.saveMessage(session.id, type, content, metadata);
    } catch (error) {
      console.error('Error auto-saving message:', error);
      return null;
    }
  }

  // Load a specific session's messages
  async loadSession(sessionId, userId) {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Verify session belongs to user
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError) throw sessionError;

      this.currentSession = session;
      return messages;
    } catch (error) {
      console.error('Error loading session:', error);
      throw error;
    }
  }

  // Clear current session (e.g., when starting fresh)
  clearCurrentSession() {
    this.currentSession = null;
  }

  // Get current session info
  getCurrentSession() {
    return this.currentSession;
  }

  // Update session title
  async updateSessionTitle(sessionId, userId, newTitle) {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (this.currentSession && this.currentSession.id === sessionId) {
        this.currentSession = data;
      }

      return data;
    } catch (error) {
      console.error('Error updating session title:', error);
      throw error;
    }
  }

  // Delete session and all its messages
  async deleteSession(sessionId, userId) {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;

      if (this.currentSession && this.currentSession.id === sessionId) {
        this.currentSession = null;
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}

export default ChatHistoryService; 