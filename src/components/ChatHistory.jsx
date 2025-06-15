import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, Trash2, Search, Calendar, Filter, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import './ChatHistory.css';

const ChatHistory = ({ onSelectSession, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions with message count
      const { data: sessionsData, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          chat_messages (
            id,
            type,
            content,
            metadata,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process sessions to add metadata
      const processedSessions = sessionsData.map(session => {
        const messages = session.chat_messages || [];
        const analysisMessages = messages.filter(msg => 
          msg.metadata && msg.metadata.isDeepfake !== undefined
        );
        
        return {
          ...session,
          messageCount: messages.length,
          analysisCount: analysisMessages.length,
          lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
          hasDeepfakes: analysisMessages.some(msg => msg.metadata.isDeepfake)
        };
      });

      setSessions(processedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions(sessions.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const loadSession = async (session) => {
    try {
      // Fetch all messages for this session
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        metadata: msg.metadata,
        timestamp: new Date(msg.created_at),
        isWelcome: false
      }));

      onSelectSession(formattedMessages);
      onClose();
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Failed to load session. Please try again.');
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (session.lastMessage?.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'deepfakes' && session.hasDeepfakes) ||
                         (filterBy === 'authentic' && !session.hasDeepfakes);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updated_at) - new Date(a.updated_at);
      case 'oldest':
        return new Date(a.updated_at) - new Date(b.updated_at);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'messages':
        return b.messageCount - a.messageCount;
      default:
        return 0;
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getSessionIcon = (session) => {
    if (session.analysisCount === 0) {
      return <MessageSquare size={16} className="chat-history-icon-message" />;
    }
    return session.hasDeepfakes ? 
      <AlertTriangle size={16} className="chat-history-icon-deepfake" /> :
      <CheckCircle size={16} className="chat-history-icon-authentic" />;
  };

  if (!user) {
    return (
      <div className="chat-history-container">
        <div className="chat-history-header">
          <h2>Chat History</h2>
          <button onClick={onClose} className="chat-history-close-button">×</button>
        </div>
        <div className="chat-history-empty">
          <MessageSquare size={48} className="chat-history-empty-icon" />
          <h3>Sign in to save your chat history</h3>
          <p>Create an account to automatically save your deepfake analysis sessions and access them anytime.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history-container">
      <div className="chat-history-header">
        <h2>Chat History</h2>
        <div className="chat-history-header-actions">
          <button 
            onClick={fetchSessions} 
            className="chat-history-refresh-button"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
          <button onClick={onClose} className="chat-history-close-button">×</button>
        </div>
      </div>

      <div className="chat-history-controls">
        <div className="chat-history-search">
          <Search size={16} className="chat-history-search-icon" />
          <input
            type="text"
            placeholder="Search chat history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="chat-history-search-input"
          />
        </div>

        <div className="chat-history-filters">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="chat-history-select"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="messages">Most Messages</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="chat-history-select"
          >
            <option value="all">All Sessions</option>
            <option value="deepfakes">With Deepfakes</option>
            <option value="authentic">Authentic Only</option>
          </select>
        </div>
      </div>

      <div className="chat-history-content">
        {loading ? (
          <div className="chat-history-loading">
            <div className="chat-history-spinner"></div>
            <p>Loading chat history...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="chat-history-empty">
            {searchTerm || filterBy !== 'all' ? (
              <>
                <Search size={48} className="chat-history-empty-icon" />
                <h3>No sessions found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </>
            ) : (
              <>
                <MessageSquare size={48} className="chat-history-empty-icon" />
                <h3>No chat history yet</h3>
                <p>Start a conversation to see your saved sessions here.</p>
              </>
            )}
          </div>
        ) : (
          <div className="chat-history-list">
            {filteredSessions.map((session) => (
              <div key={session.id} className="chat-history-item">
                <div 
                  className="chat-history-item-content"
                  onClick={() => loadSession(session)}
                >
                  <div className="chat-history-item-header">
                    <div className="chat-history-item-title">
                      {getSessionIcon(session)}
                      <span>{session.title}</span>
                    </div>
                    <div className="chat-history-item-date">
                      <Clock size={14} />
                      {formatDate(session.updated_at)}
                    </div>
                  </div>

                  <div className="chat-history-item-preview">
                    {session.lastMessage?.content 
                      ? session.lastMessage.content.substring(0, 100) + '...'
                      : 'No messages yet'
                    }
                  </div>

                  <div className="chat-history-item-stats">
                    <span className="chat-history-stat">
                      {session.messageCount} message{session.messageCount !== 1 ? 's' : ''}
                    </span>
                    {session.analysisCount > 0 && (
                      <span className="chat-history-stat">
                        {session.analysisCount} analysis{session.analysisCount !== 1 ? 'es' : ''}
                      </span>
                    )}
                    {session.hasDeepfakes && (
                      <span className="chat-history-stat deepfake">
                        Deepfakes detected
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="chat-history-delete-button"
                  title="Delete session"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory; 