import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Upload, MessageSquare, Shield, AlertTriangle, CheckCircle, Brain, TrendingUp, Cpu, Zap, Activity, User, LogOut } from 'lucide-react';
import DeepfakeAgent from './agents/DeepfakeAgent';
import ApiService from './services/ApiService';
import { useAuth } from './context/AuthContext';
import './styles/DeepfakeDetectionAgent.css';

const DeepfakeDetectionAgent = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      content: `Hello **${user?.user_metadata?.first_name || 'there'}**! I'm **DeepShield AI Cloud**, your advanced cloud-based deepfake detection specialist. I use **6 enhanced detection methods** powered by cloud infrastructure to provide forensic-quality analysis with maximum accuracy.\n\n**Cloud-Based Capabilities:**\n🔍 **6-Method Cloud Analysis** - Facial landmarks, edge artifacts, texture, frequency, eye movement, and lighting\n☁️ **Secure Cloud Processing** - AWS S3 integration with advanced ML models\n📊 **Higher Accuracy** - Cloud-powered algorithms with 96.8% accuracy\n🔒 **Secure Storage** - Analysis results stored in Supabase database\n🧠 **Intelligent Responses** - Powered by advanced AI conversation\n\n**Ready for cloud-powered detection?** Upload a file or ask me anything!`,
      timestamp: new Date(),
      isWelcome: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agent] = useState(() => new DeepfakeAgent());
  const [apiService] = useState(() => new ApiService());
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content, metadata = null) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      metadata,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateProgress = useCallback((step, progress) => {
    setCurrentStep(step);
    setAnalysisProgress(progress);
  }, []);

  const formatBackendResponse = (result, file) => {
    const { detection_result } = result;
    const { is_deepfake, confidence, analysis_methods, processing_time, file_metadata } = detection_result;
    
    // Convert confidence to percentage
    const confidencePercent = (confidence * 100);
    
    let content = `**Confidence Level:** ${confidencePercent.toFixed(1)}% (Cloud Analysis)\n\n`;
    
    content += `**🎯 Executive Summary:**\n`;
    if (is_deepfake) {
      content += `This content shows ${confidencePercent > 85 ? 'strong' : 'moderate'} indicators of AI manipulation. `;
      content += `Our cloud-based ensemble detection system analyzed the file using 6 advanced methods.\n\n`;
    } else {
      content += `This content appears authentic based on comprehensive cloud analysis. `;
      content += `The advanced detection algorithms found minimal manipulation indicators across all analysis methods. `;
      content += `While no detection is 100% certain, the evidence strongly suggests this is genuine content.\n\n`;
    }

    content += `**🔬 Enhanced Detection Methods Used:**\n\n`;
    
    // Format analysis methods
    Object.entries(analysis_methods).forEach(([methodName, methodData]) => {
      const displayName = methodName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const methodConfidence = (methodData.confidence * 100);
      
      content += `**${displayName}**\n`;
      content += `• Detection Score: ${methodConfidence.toFixed(1)}%\n`;
      content += `• Analysis: ${methodData.details || 'Advanced pattern analysis completed'}\n`;
      content += `• Result: ${interpretMethodScore(methodConfidence, methodName)}\n\n`;
    });
    
    content += `**📊 Processing Details:**\n`;
    content += `• Processing Time: ${processing_time.toFixed(2)} seconds\n`;
    content += `• File Size: ${file_metadata.size_bytes ? (file_metadata.size_bytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}\n`;
    if (file_metadata.dimensions) {
      content += `• Dimensions: ${file_metadata.dimensions}\n`;
    }
    if (file_metadata.total_frames) {
      content += `• Total Frames: ${file_metadata.total_frames}\n`;
      content += `• Analyzed Frames: ${file_metadata.analyzed_frames}\n`;
    }
    
    return {
      type: 'analysis',
      title: is_deepfake ? '🚨 DEEPFAKE DETECTED' : '✅ AUTHENTIC CONTENT',
      confidence: confidencePercent.toFixed(1),
      isDeepfake: is_deepfake,
      content: content,
      recommendations: generateRecommendations(is_deepfake, confidencePercent),
      followUpQuestions: [
        "Would you like me to explain any specific detection method in detail?",
        "Do you have questions about the cloud-based confidence scoring?",
        "Should I analyze another file for comparison?"
      ],
      metadata: {
        isDeepfake: is_deepfake,
        confidence: confidencePercent.toFixed(1),
        title: is_deepfake ? '🚨 DEEPFAKE DETECTED' : '✅ AUTHENTIC CONTENT'
      }
    };
  };

  const interpretMethodScore = (score, methodName) => {
    if (score > 80) return `Strong indicators of manipulation detected`;
    if (score > 60) return `Moderate signs of artificial generation found`;
    if (score > 35) return `Some inconsistencies noted, requires further analysis`;
    if (score > 15) return `Minor irregularities detected, likely authentic`;
    return `No significant manipulation indicators found`;
  };

  const generateRecommendations = (isDeepfake, confidence) => {
    const recommendations = [];
    
    if (isDeepfake) {
      recommendations.push("🚨 **High Priority:** Do not share or distribute this content");
      recommendations.push("🔍 **Verify Source:** Investigate the origin and context of this media");
      recommendations.push("📋 **Document Evidence:** Save analysis results for potential legal proceedings");
      if (confidence > 90) {
        recommendations.push("⚖️ **Legal Action:** Consider consulting legal counsel for malicious use");
      }
    } else {
      recommendations.push("✅ **Likely Authentic:** Content appears genuine based on cloud analysis");
      recommendations.push("🔄 **Cross-Reference:** Verify through additional sources when possible");
      recommendations.push("📈 **Monitor:** Stay alert for variants or manipulated versions");
      if (confidence < 30) {
        recommendations.push("⚠️ **Low Confidence:** Consider additional verification methods");
      }
    }
    
    return recommendations;
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/mov', 'video/webm'];
    const maxSize = 50 * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
      addMessage('agent', `❌ **Unsupported File Type**\n\nPlease upload one of these formats:\n• Images: JPG, PNG, WebP, GIF\n• Videos: MP4, MOV, WebM\n\n**For best results:** Use high-resolution images (1080p+)`);
      return;
    }
    
    if (file.size > maxSize) {
      addMessage('agent', `❌ **File Too Large**\n\nPlease upload files smaller than 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.\n\n**Tip:** Higher resolution images provide more accurate detection.`);
      return;
    }
    
    addMessage('user', `📁 **Uploaded:** ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    setIsProcessing(true);
    setAnalysisProgress(0);
    
    addMessage('agent', "🔍 **Starting Enhanced Cloud-Based Deepfake Analysis...**\n\nI'll analyze your file using our advanced cloud infrastructure:\n• Secure S3 Upload\n• 6-Method Ensemble Detection\n• Advanced ML Models (PyTorch/TensorFlow)\n• Facial Landmark Analysis\n• Edge Artifact Detection\n• Texture & Frequency Analysis\n• Eye Movement & Lighting Analysis\n\nThis comprehensive cloud-based approach ensures maximum accuracy and security.");

    try {
      // Use the new backend workflow
      const result = await apiService.uploadAndAnalyzeFile(file, updateProgress);
      
      setCurrentStep('');
      setAnalysisProgress(0);
      
      // Format the response to match the existing UI expectations
      const formattedResponse = formatBackendResponse(result, file);
      addMessage('agent', formattedResponse.content, formattedResponse);
      
      if (formattedResponse.recommendations) {
        const recContent = "**🎯 Enhanced Recommendations:**\n\n" + formattedResponse.recommendations.map(rec => rec).join('\n');
        addMessage('agent', recContent);
      }
      
    } catch (error) {
      console.error('Upload and analysis failed:', error);
      addMessage('agent', `❌ **Enhanced Analysis Error:** ${error.message}\n\nThe cloud-based detection system encountered an issue. This could be due to:\n• Network connectivity issues\n• Backend service unavailability\n• File processing errors\n\n**Fallback:** You can try uploading a different file or check your internet connection.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserMessage = async (message) => {
    if (!message.trim()) return;

    addMessage('user', message);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await agent.processInput(message);
      addMessage('agent', response.content, response);
      
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsContent = "**💡 Enhanced Suggestions:**\n" + response.suggestions.map(s => `• ${s}`).join('\n');
        addMessage('agent', suggestionsContent);
      }
      
    } catch (error) {
      addMessage('agent', `❌ **Error:** I encountered an issue processing your request. The enhanced system is designed to handle complex queries - please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleUserMessage(suggestion);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const quickActions = [
    { text: "How does cloud detection work?", icon: Brain },
    { text: "What's new in cloud-based analysis?", icon: TrendingUp },
    { text: "Latest deepfake threats?", icon: AlertTriangle },
    { text: "Upload for cloud analysis", action: () => fileInputRef.current?.click(), icon: Upload }
  ];

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const getConfidenceClass = (confidence) => {
    const conf = parseFloat(confidence);
    if (conf > 85) return 'high';
    if (conf > 70) return 'medium';
    return 'low';
  };

  return (
    <div className="deepfake-container">
      {/* Header */}
      <div className="deepfake-header">
        <div className="deepfake-header-left">
          <div className="deepfake-logo">
            <div className="deepfake-logo-icon">
              <Shield size={28} color="white" />
            </div>
            <div className="deepfake-status-dot">
              <Cpu size={8} color="white" />
            </div>
          </div>
          <div>
            <h1 className="deepfake-title">DeepShield AI Cloud</h1>
            <p className="deepfake-subtitle">Cloud-Based 6-Method Detection System</p>
          </div>
        </div>
        
        <div className="deepfake-header-right">
          <div className="deepfake-stats">
            <div className="deepfake-accuracy">96.8% Accuracy</div>
            <div className="deepfake-model">Cloud Ensemble v4.0</div>
          </div>
          <div className="deepfake-status">
            <div className="deepfake-status-indicator"></div>
            <span className="deepfake-status-text">Cloud Online</span>
          </div>
          
          {/* User Profile Menu */}
          <div className="deepfake-user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="deepfake-user-button"
            >
              <User size={20} />
              <span className="deepfake-user-name">{getUserDisplayName()}</span>
            </button>
            
            {showUserMenu && (
              <div className="deepfake-user-menu">
                <div className="deepfake-user-menu-header">
                  <div className="deepfake-user-info">
                    <div className="deepfake-user-display-name">{getUserDisplayName()}</div>
                    <div className="deepfake-user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="deepfake-user-menu-divider"></div>
                <button
                  onClick={handleLogout}
                  className="deepfake-user-menu-item"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && analysisProgress > 0 && (
        <div className="deepfake-progress-bar">
          <Activity size={16} color="#60a5fa" />
          <div className="deepfake-progress-content">
            <div className="deepfake-progress-text">{currentStep}</div>
            <div className="deepfake-progress-track">
              <div 
                className="deepfake-progress-fill"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="deepfake-progress-percent">{analysisProgress}%</div>
        </div>
      )}

      {/* Messages */}
      <div className="deepfake-messages">
        {messages.map((message) => (
          <div key={message.id} className={message.type === 'user' ? 'deepfake-message-container-user' : 'deepfake-message-container'}>
            {message.type === 'agent' && (
              <div className="deepfake-avatar deepfake-avatar-agent">
                <Bot size={24} color="white" />
              </div>
            )}
            
            <div className={`deepfake-message ${message.type === 'user' ? 'deepfake-message-user' : 'deepfake-message-agent'}`}>
              {message.metadata?.title && (
                <div className={`deepfake-message-title ${message.metadata.isDeepfake ? 'deepfake' : 'authentic'}`}>
                  {message.metadata.isDeepfake ? 
                    <AlertTriangle size={20} /> : 
                    <CheckCircle size={20} />
                  }
                  {message.metadata.title}
                </div>
              )}
              
              <div 
                className="deepfake-message-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              
              {message.metadata?.confidence && (
                <div className="deepfake-confidence-score">
                  <div className="deepfake-confidence-header">
                    <span className="deepfake-confidence-label">Cloud Confidence Score</span>
                    <span className={`deepfake-confidence-value ${getConfidenceClass(message.metadata.confidence)}`}>
                      {message.metadata.confidence}%
                    </span>
                  </div>
                  <div className="deepfake-confidence-track">
                    <div 
                      className={`deepfake-confidence-fill ${getConfidenceClass(message.metadata.confidence)}`}
                      style={{ width: `${message.metadata.confidence}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="deepfake-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            {message.type === 'user' && (
              <div className="deepfake-avatar deepfake-avatar-user">
                <MessageSquare size={24} color="white" />
              </div>
            )}
          </div>
        ))}
        
        {isProcessing && (
          <div className="deepfake-message-container">
            <div className="deepfake-avatar deepfake-avatar-agent">
              <Bot size={24} color="white" />
            </div>
            <div className="deepfake-message deepfake-message-agent">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="deepfake-loading-spinner"></div>
                <span>Running cloud analysis...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="deepfake-quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action || (() => handleSuggestionClick(action.text))}
              className="deepfake-quick-action"
            >
              <action.icon size={16} />
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="deepfake-input-area">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept="image/*,video/*"
          className="deepfake-file-input"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="deepfake-upload-button"
        >
          <Upload size={20} />
          Cloud Upload
        </button>
        
        <div className="deepfake-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleUserMessage(input)}
            placeholder="Ask about cloud-based 6-method detection, upload files, or get security advice..."
            disabled={isProcessing}
            className="deepfake-input"
          />
        </div>
        
        <button
          onClick={() => handleUserMessage(input)}
          disabled={isProcessing || !input.trim()}
          className="deepfake-send-button"
        >
          <Zap size={20} />
          Send
        </button>
      </div>
    </div>
  );
};

export default DeepfakeDetectionAgent;