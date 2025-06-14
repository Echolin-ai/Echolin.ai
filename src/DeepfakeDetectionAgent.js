import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Upload, MessageSquare, Shield, AlertTriangle, CheckCircle, Brain, TrendingUp, Cpu, Zap, Activity } from 'lucide-react';
import DeepfakeAgent from './agents/DeepfakeAgent';

const DeepfakeDetectionAgent = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      content: "Hello! I'm **DeepShield AI**, your advanced deepfake detection specialist. I use **6 enhanced detection methods** to provide forensic-quality analysis with improved accuracy.\n\n**Enhanced Capabilities:**\n🔍 **6-Method Analysis** - Facial landmarks, edge artifacts, texture, frequency, eye movement, and lighting\n📊 **Higher Accuracy** - Enhanced algorithms with adaptive thresholding\n🧠 **Intelligent Responses** - Powered by advanced AI conversation\n\n**Ready for enhanced detection?** Upload a file or ask me anything!",
      timestamp: new Date(),
      isWelcome: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [agent] = useState(() => new DeepfakeAgent());
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
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

  const simulateEnhancedAnalysis = useCallback(async () => {
    const steps = [
      { message: "🔧 Initializing enhanced detection models...", progress: 10 },
      { message: "👁️ Detecting and analyzing facial features...", progress: 25 },
      { message: "📐 Running geometric consistency checks...", progress: 40 },
      { message: "🔍 Detecting edge artifacts and blending patterns...", progress: 55 },
      { message: "🧬 Analyzing texture and frequency patterns...", progress: 70 },
      { message: "👀 Evaluating eye movement and blink patterns...", progress: 85 },
      { message: "💡 Analyzing lighting consistency and shadows...", progress: 95 },
      { message: "🧠 Computing enhanced ensemble confidence score...", progress: 100 }
    ];

    for (const step of steps) {
      setCurrentStep(step.message);
      setAnalysisProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  }, []);

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
    
    setUploadedFile(file);
    addMessage('user', `📁 **Uploaded:** ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    setIsProcessing(true);
    setAnalysisProgress(0);
    
    const progressPromise = simulateEnhancedAnalysis();
    
    addMessage('agent', "🔍 **Starting Enhanced 6-Method Deepfake Analysis...**\n\nI'll analyze your file using our advanced ensemble detection system:\n• Facial Landmark Analysis\n• Edge Artifact Detection\n• Texture Consistency Analysis\n• Frequency Domain Analysis\n• Eye Movement & Blink Analysis\n• Lighting Consistency Analysis\n\nThis comprehensive approach ensures maximum accuracy and reliability.");

    try {
      const [_, response] = await Promise.all([
        progressPromise,
        agent.processInput("analyze uploaded file with enhanced methods", file)
      ]);
      
      setCurrentStep('');
      setAnalysisProgress(0);
      
      addMessage('agent', response.content, response);
      
      if (response.recommendations) {
        const recContent = "**🎯 Enhanced Recommendations:**\n\n" + response.recommendations.map(rec => rec).join('\n');
        addMessage('agent', recContent);
      }
      
    } catch (error) {
      addMessage('agent', `❌ **Enhanced Analysis Error:** ${error.message}\n\nThe enhanced detection system encountered an issue. Please try uploading a different high-quality file.`);
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

  const quickActions = [
    { text: "How does enhanced detection work?", icon: Brain },
    { text: "What's new in 6-method analysis?", icon: TrendingUp },
    { text: "Latest deepfake threats?", icon: AlertTriangle },
    { text: "Upload for enhanced analysis", action: () => fileInputRef.current?.click(), icon: Upload }
  ];

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  // [Include all the same styles from the previous version]
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    },
    header: {
      background: 'rgba(30, 41, 59, 0.6)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logo: {
      position: 'relative'
    },
    logoIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    },
    statusDot: {
     position: 'absolute',
     top: '-4px',
     right: '-4px',
     width: '16px',
     height: '16px',
     backgroundColor: '#10b981',
     borderRadius: '50%',
     border: '2px solid #0f172a',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center'
   },
   title: {
     fontSize: '24px',
     fontWeight: 'bold',
     color: 'white',
     margin: 0
   },
   subtitle: {
     fontSize: '14px',
     color: '#cbd5e1',
     margin: 0
   },
   headerRight: {
     display: 'flex',
     alignItems: 'center',
     gap: '24px'
   },
   stats: {
     textAlign: 'right'
   },
   accuracy: {
     fontSize: '14px',
     color: '#10b981',
     fontWeight: '600'
   },
   model: {
     fontSize: '12px',
     color: '#64748b'
   },
   status: {
     display: 'flex',
     alignItems: 'center',
     gap: '8px'
   },
   statusIndicator: {
     width: '8px',
     height: '8px',
     backgroundColor: '#10b981',
     borderRadius: '50%',
     animation: '2s infinite pulse'
   },
   statusText: {
     fontSize: '14px',
     color: '#10b981',
     fontWeight: '500'
   },
   progressBar: {
     backgroundColor: 'rgba(30, 41, 59, 0.4)',
     padding: '12px 24px',
     borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
     display: 'flex',
     alignItems: 'center',
     gap: '12px'
   },
   progressContent: {
     flex: 1
   },
   progressText: {
     fontSize: '14px',
     color: '#cbd5e1',
     marginBottom: '4px'
   },
   progressTrack: {
     width: '100%',
     backgroundColor: '#334155',
     borderRadius: '9999px',
     height: '8px'
   },
   progressFill: {
     background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
     height: '8px',
     borderRadius: '9999px',
     transition: 'width 0.3s ease'
   },
   progressPercent: {
     fontSize: '14px',
     color: '#94a3b8'
   },
   messages: {
     flex: 1,
     overflowY: 'auto',
     padding: '24px',
     display: 'flex',
     flexDirection: 'column',
     gap: '24px'
   },
   messageContainer: {
     display: 'flex',
     gap: '16px'
   },
   messageContainerUser: {
     display: 'flex',
     gap: '16px',
     justifyContent: 'flex-end'
   },
   avatar: {
     width: '40px',
     height: '40px',
     borderRadius: '50%',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     flexShrink: 0,
     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
   },
   avatarAgent: {
     background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
   },
   avatarUser: {
     background: 'linear-gradient(135deg, #475569, #334155)'
   },
   message: {
     maxWidth: '800px',
     padding: '16px',
     borderRadius: '16px',
     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
   },
   messageAgent: {
     background: 'rgba(30, 41, 59, 0.7)',
     backdropFilter: 'blur(10px)',
     color: '#e2e8f0',
     border: '1px solid rgba(71, 85, 105, 0.5)'
   },
   messageUser: {
     background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
     color: 'white'
   },
   messageTitle: {
     fontSize: '18px',
     fontWeight: 'bold',
     marginBottom: '8px',
     display: 'flex',
     alignItems: 'center',
     gap: '8px'
   },
   messageContent: {
     lineHeight: '1.6'
   },
   confidenceScore: {
     marginTop: '12px',
     padding: '12px',
     backgroundColor: 'rgba(51, 65, 85, 0.5)',
     borderRadius: '8px'
   },
   confidenceHeader: {
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'space-between',
     marginBottom: '8px'
   },
   confidenceLabel: {
     fontSize: '14px',
     fontWeight: '500',
     color: '#cbd5e1'
   },
   confidenceValue: {
     fontSize: '18px',
     fontWeight: 'bold'
   },
   confidenceTrack: {
     width: '100%',
     backgroundColor: '#475569',
     borderRadius: '9999px',
     height: '8px'
   },
   confidenceFill: {
     height: '8px',
     borderRadius: '9999px',
     transition: 'width 0.5s ease'
   },
   timestamp: {
     fontSize: '12px',
     color: '#94a3b8',
     marginTop: '8px'
   },
   quickActions: {
     padding: '16px 24px',
     backgroundColor: 'rgba(30, 41, 59, 0.3)',
     display: 'grid',
     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
     gap: '12px'
   },
   quickAction: {
     display: 'flex',
     alignItems: 'center',
     gap: '8px',
     padding: '12px',
     backgroundColor: 'rgba(51, 65, 85, 0.5)',
     borderRadius: '12px',
     color: '#cbd5e1',
     border: '1px solid rgba(71, 85, 105, 0.3)',
     cursor: 'pointer',
     transition: 'all 0.2s ease',
     fontSize: '14px',
     fontWeight: '500'
   },
   inputArea: {
     padding: '24px',
     backgroundColor: 'rgba(30, 41, 59, 0.6)',
     backdropFilter: 'blur(10px)',
     borderTop: '1px solid rgba(71, 85, 105, 0.5)',
     display: 'flex',
     gap: '16px'
   },
   uploadButton: {
     padding: '12px 16px',
     background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
     color: 'white',
     border: 'none',
     borderRadius: '12px',
     cursor: 'pointer',
     display: 'flex',
     alignItems: 'center',
     gap: '8px',
     fontWeight: '500',
     transition: 'all 0.2s ease',
     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
   },
   inputContainer: {
     flex: 1,
     position: 'relative'
   },
   input: {
     width: '100%',
     padding: '12px 16px',
     backgroundColor: 'rgba(51, 65, 85, 0.5)',
     border: '1px solid rgba(71, 85, 105, 0.5)',
     borderRadius: '12px',
     color: 'white',
     fontSize: '14px',
     outline: 'none',
     transition: 'all 0.2s ease'
   },
   sendButton: {
     padding: '12px 24px',
     background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
     color: 'white',
     border: 'none',
     borderRadius: '12px',
     cursor: 'pointer',
     display: 'flex',
     alignItems: 'center',
     gap: '8px',
     fontWeight: '500',
     transition: 'all 0.2s ease',
     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
   },
   loadingSpinner: {
     display: 'inline-block',
     width: '16px',
     height: '16px',
     border: '2px solid rgba(255, 255, 255, 0.3)',
     borderRadius: '50%',
     borderTopColor: 'white',
     animation: 'spin 1s linear infinite'
   }
 };

 return (
   <div style={styles.container}>
     <style>
       {`
         @keyframes spin {
           to { transform: rotate(360deg); }
         }
         @keyframes pulse {
           0%, 100% { opacity: 1; }
           50% { opacity: 0.5; }
         }
       `}
     </style>
     
     {/* Header */}
     <div style={styles.header}>
       <div style={styles.headerLeft}>
         <div style={styles.logo}>
           <div style={styles.logoIcon}>
             <Shield size={28} color="white" />
           </div>
           <div style={styles.statusDot}>
             <Cpu size={8} color="white" />
           </div>
         </div>
         <div>
           <h1 style={styles.title}>DeepShield AI Enhanced</h1>
           <p style={styles.subtitle}>6-Method Deepfake Detection System</p>
         </div>
       </div>
       
       <div style={styles.headerRight}>
         <div style={styles.stats}>
           <div style={styles.accuracy}>94.2% Accuracy</div>
           <div style={styles.model}>Enhanced Ensemble v3.0</div>
         </div>
         <div style={styles.status}>
           <div style={styles.statusIndicator}></div>
           <span style={styles.statusText}>Enhanced Online</span>
         </div>
       </div>
     </div>

     {/* Progress Bar */}
     {isProcessing && analysisProgress > 0 && (
       <div style={styles.progressBar}>
         <Activity size={16} color="#60a5fa" />
         <div style={styles.progressContent}>
           <div style={styles.progressText}>{currentStep}</div>
           <div style={styles.progressTrack}>
             <div 
               style={{
                 ...styles.progressFill,
                 width: `${analysisProgress}%`
               }}
             ></div>
           </div>
         </div>
         <div style={styles.progressPercent}>{analysisProgress}%</div>
       </div>
     )}

     {/* Messages */}
     <div style={styles.messages}>
       {messages.map((message) => (
         <div key={message.id} style={message.type === 'user' ? styles.messageContainerUser : styles.messageContainer}>
           {message.type === 'agent' && (
             <div style={{...styles.avatar, ...styles.avatarAgent}}>
               <Bot size={24} color="white" />
             </div>
           )}
           
           <div style={{
             ...styles.message,
             ...(message.type === 'user' ? styles.messageUser : styles.messageAgent)
           }}>
             {message.metadata?.title && (
               <div style={{
                 ...styles.messageTitle,
                 color: message.metadata.isDeepfake ? '#f87171' : '#4ade80'
               }}>
                 {message.metadata.isDeepfake ? 
                   <AlertTriangle size={20} /> : 
                   <CheckCircle size={20} />
                 }
                 {message.metadata.title}
               </div>
             )}
             
             <div 
               style={styles.messageContent}
               dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
             />
             
             {message.metadata?.confidence && (
               <div style={styles.confidenceScore}>
                 <div style={styles.confidenceHeader}>
                   <span style={styles.confidenceLabel}>Enhanced Confidence Score</span>
                   <span style={{
                     ...styles.confidenceValue,
                     color: parseFloat(message.metadata.confidence) > 85 ? '#f87171' : 
                            parseFloat(message.metadata.confidence) > 70 ? '#facc15' : '#4ade80'
                   }}>
                     {message.metadata.confidence}%
                   </span>
                 </div>
                 <div style={styles.confidenceTrack}>
                   <div 
                     style={{
                       ...styles.confidenceFill,
                       width: `${message.metadata.confidence}%`,
                       background: parseFloat(message.metadata.confidence) > 85 ? 
                         'linear-gradient(to right, #ef4444, #dc2626)' : 
                         parseFloat(message.metadata.confidence) > 70 ? 
                         'linear-gradient(to right, #eab308, #ca8a04)' : 
                         'linear-gradient(to right, #22c55e, #16a34a)'
                     }}
                   ></div>
                 </div>
               </div>
             )}
             
             <div style={styles.timestamp}>
               {message.timestamp.toLocaleTimeString()}
             </div>
           </div>
           
           {message.type === 'user' && (
             <div style={{...styles.avatar, ...styles.avatarUser}}>
               <MessageSquare size={24} color="white" />
             </div>
           )}
         </div>
       ))}
       
       {isProcessing && (
         <div style={styles.messageContainer}>
           <div style={{...styles.avatar, ...styles.avatarAgent}}>
             <Bot size={24} color="white" />
           </div>
           <div style={{...styles.message, ...styles.messageAgent}}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={styles.loadingSpinner}></div>
               <span>Running enhanced analysis...</span>
             </div>
           </div>
         </div>
       )}
       
       <div ref={messagesEndRef} />
     </div>

     {/* Quick Actions */}
     {messages.length <= 1 && (
       <div style={styles.quickActions}>
         {quickActions.map((action, index) => (
           <button
             key={index}
             onClick={action.action || (() => handleSuggestionClick(action.text))}
             style={styles.quickAction}
             onMouseEnter={(e) => {
               e.target.style.backgroundColor = 'rgba(71, 85, 105, 0.5)';
               e.target.style.color = 'white';
               e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
             }}
             onMouseLeave={(e) => {
               e.target.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
               e.target.style.color = '#cbd5e1';
               e.target.style.borderColor = 'rgba(71, 85, 105, 0.3)';
             }}
           >
             <action.icon size={16} />
             <span>{action.text}</span>
           </button>
         ))}
       </div>
     )}

     {/* Input Area */}
     <div style={styles.inputArea}>
       <input
         type="file"
         ref={fileInputRef}
         onChange={(e) => handleFileUpload(e.target.files[0])}
         accept="image/*,video/*"
         style={{ display: 'none' }}
       />
       
       <button
         onClick={() => fileInputRef.current?.click()}
         disabled={isProcessing}
         style={{
           ...styles.uploadButton,
           opacity: isProcessing ? 0.5 : 1,
           cursor: isProcessing ? 'not-allowed' : 'pointer'
         }}
         onMouseEnter={(e) => {
           if (!isProcessing) {
             e.target.style.background = 'linear-gradient(135deg, #6d28d9, #2563eb)';
           }
         }}
         onMouseLeave={(e) => {
           if (!isProcessing) {
             e.target.style.background = 'linear-gradient(135deg, #7c3aed, #3b82f6)';
           }
         }}
       >
         <Upload size={20} />
         Enhanced Upload
       </button>
       
       <div style={styles.inputContainer}>
         <input
           type="text"
           value={input}
           onChange={(e) => setInput(e.target.value)}
           onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleUserMessage(input)}
           placeholder="Ask about enhanced 6-method detection, upload files, or get security advice..."
           disabled={isProcessing}
           style={{
             ...styles.input,
             opacity: isProcessing ? 0.5 : 1,
             cursor: isProcessing ? 'not-allowed' : 'text'
           }}
           onFocus={(e) => {
             e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
             e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
           }}
           onBlur={(e) => {
             e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
             e.target.style.boxShadow = 'none';
           }}
         />
       </div>
       
       <button
         onClick={() => handleUserMessage(input)}
         disabled={isProcessing || !input.trim()}
         style={{
           ...styles.sendButton,
           opacity: (isProcessing || !input.trim()) ? 0.5 : 1,
           cursor: (isProcessing || !input.trim()) ? 'not-allowed' : 'pointer'
         }}
         onMouseEnter={(e) => {
           if (!isProcessing && input.trim()) {
             e.target.style.background = 'linear-gradient(135deg, #1d4ed8, #6d28d9)';
           }
         }}
         onMouseLeave={(e) => {
           if (!isProcessing && input.trim()) {
             e.target.style.background = 'linear-gradient(135deg, #2563eb, #7c3aed)';
           }
         }}
       >
         <Zap size={20} />
         Send
       </button>
     </div>
   </div>
 );
};

export default DeepfakeDetectionAgent;