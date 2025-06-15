import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = ({ onToggleSignUp, onSkip }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background-overlay"></div>
      </div>
      
      <div className="login-content">
        <button 
          onClick={onSkip}
          className="login-close-button"
          disabled={isLoading}
        >
          <X size={24} />
        </button>
        
        <div className="login-header">
          <div className="login-logo">
            <Shield size={40} color="#3b82f6" />
            <div className="login-logo-pulse"></div>
          </div>
          <h1 className="login-title">Welcome to DeepShield AI</h1>
          <p className="login-subtitle">
            Sign in to save your analysis history and access advanced features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-input-group">
            <div className="login-input-wrapper">
              <Mail size={20} className="login-input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="login-input-group">
            <div className="login-input-wrapper">
              <Lock size={20} className="login-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-submit-button"
          >
            {isLoading ? (
              <div className="login-spinner"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-actions">
          <button
            onClick={onSkip}
            className="login-skip-button"
            disabled={isLoading}
          >
            Continue without account
          </button>
          
          <p className="login-signup-text">
            Don't have an account?{' '}
            <button
              onClick={onToggleSignUp}
              className="login-signup-link"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="login-features">
          <h3>Why sign up?</h3>
          <ul>
            <li>💾 Save and access your analysis history</li>
            <li>📊 Track detection patterns over time</li>
            <li>🔒 Secure cloud storage for your data</li>
            <li>⚡ Faster processing with account benefits</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login; 