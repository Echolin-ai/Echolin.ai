import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the AuthContext
const AuthContext = createContext({});

// Mock user data for development (replace with real authentication service)
const mockUser = {
  id: 1,
  email: 'user@deepshield.ai',
  user_metadata: {
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false);

  // Mock sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call your auth service
      console.log('Signing out user...');
      // For now, we'll keep the user signed in for demo purposes
      // setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock sign in function
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      // Mock authentication
      setUser(mockUser);
      return { user: mockUser };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 