import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database table schemas for reference:
// 
// chat_sessions table:
// - id (uuid, primary key)
// - user_id (uuid, foreign key to auth.users)
// - title (text)
// - created_at (timestamp)
// - updated_at (timestamp)
//
// chat_messages table:
// - id (uuid, primary key)
// - session_id (uuid, foreign key to chat_sessions)
// - type (text: 'user' or 'agent')
// - content (text)
// - metadata (jsonb, nullable)
// - created_at (timestamp)
//
// SQL to create tables:
// 
// CREATE TABLE chat_sessions (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
//   title TEXT NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT NOW(),
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE TABLE chat_messages (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
//   type TEXT NOT NULL CHECK (type IN ('user', 'agent')),
//   content TEXT NOT NULL,
//   metadata JSONB,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// Enable RLS:
// ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
// ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
//
// RLS Policies:
// CREATE POLICY "Users can view own sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
// CREATE POLICY "Users can insert own sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
// CREATE POLICY "Users can update own sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
// CREATE POLICY "Users can delete own sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);
//
// CREATE POLICY "Users can view messages from own sessions" ON chat_messages FOR SELECT USING (
//   EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
// );
// CREATE POLICY "Users can insert messages to own sessions" ON chat_messages FOR INSERT WITH CHECK (
//   EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
// ); 