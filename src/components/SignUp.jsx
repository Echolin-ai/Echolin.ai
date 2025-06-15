import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SignUp.css';

const SignUp = ({ onToggleLogin, onSkip }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { signUp } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your first and last name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-background">
          <div className="signup-background-overlay"></div>
        </div>
        
        <div className="signup-content">
          <button 
            onClick={onSkip}
            className="signup-close-button"
          >
            <X size={24} />
          </button>
          
          <div className="signup-success">
            <div className="signup-success-icon">
              <CheckCircle size={64} color="#10b981" />
            </div>
            <h1 className="signup-success-title">Account Created!</h1>
            <p className="signup-success-message">
              Please check your email to verify your account. Once verified, you can sign in and start saving your analysis history.
            </p>
            <button
              onClick={onToggleLogin}
              className="signup-success-button"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-background">
        <div className="signup-background-overlay"></div>
      </div>
      
      <div className="signup-content">
        <button 
          onClick={onSkip}
          className="signup-close-button"
          disabled={isLoading}
        >
          <X size={24} />
        </button>
        
        <div className="signup-header">
          <div className="signup-logo">
            <Shield size={40} color="#3b82f6" />
            <div className="signup-logo-pulse"></div>
          </div>
          <h1 className="signup-title">Join DeepShield AI</h1>
          <p className="signup-subtitle">
            Create your account to unlock advanced features and save your analysis history
          </p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && (
            <div className="signup-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="signup-name-row">
            <div className="signup-input-group">
              <div className="signup-input-wrapper">
                <User size={20} className="signup-input-icon" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="signup-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="signup-input-group">
              <div className="signup-input-wrapper">
                <User size={20} className="signup-input-icon" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="signup-input"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="signup-input-group">
            <div className="signup-input-wrapper">
              <Mail size={20} className="signup-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="signup-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="signup-input-group">
            <div className="signup-input-wrapper">
              <Lock size={20} className="signup-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                className="signup-input"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="signup-password-toggle"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="signup-input-group">
            <div className="signup-input-wrapper">
              <Lock size={20} className="signup-input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="signup-input"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="signup-password-toggle"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="signup-submit-button"
          >
            {isLoading ? (
              <div className="signup-spinner"></div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="signup-divider">
          <span>or</span>
        </div>

        <div className="signup-actions">
          <button
            onClick={onSkip}
            className="signup-skip-button"
            disabled={isLoading}
          >
            Continue without account
          </button>
          
          <p className="signup-login-text">
            Already have an account?{' '}
            <button
              onClick={onToggleLogin}
              className="signup-login-link"
              disabled={isLoading}
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="signup-benefits">
          <h3>Account Benefits</h3>
          <div className="signup-benefits-grid">
            <div className="signup-benefit">
              <div className="signup-benefit-icon">💾</div>
              <div>
                <h4>Analysis History</h4>
                <p>Save and review all your deepfake analyses</p>
              </div>
            </div>
            <div className="signup-benefit">
              <div className="signup-benefit-icon">📊</div>
              <div>
                <h4>Pattern Tracking</h4>
                <p>Monitor detection trends over time</p>
              </div>
            </div>
            <div className="signup-benefit">
              <div className="signup-benefit-icon">🔒</div>
              <div>
                <h4>Secure Storage</h4>
                <p>Your data is encrypted and protected</p>
              </div>
            </div>
            <div className="signup-benefit">
              <div className="signup-benefit-icon">⚡</div>
              <div>
                <h4>Priority Processing</h4>
                <p>Faster analysis with account benefits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 