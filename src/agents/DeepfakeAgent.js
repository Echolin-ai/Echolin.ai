import deepfakeDetector from '../utils/deepfakeDetection';
import LLMService from '../services/LLMService';

class DeepfakeAgent {
  constructor() {
    this.name = "DeepShield AI";
    this.conversationContext = [];
    this.userProfile = {
      technicalLevel: 'intermediate',
      interests: [],
      previousQuestions: []
    };
    
    this.detectionEngine = deepfakeDetector;
    this.llmService = LLMService;
    this.analysisHistory = [];
  }

  async processInput(userInput, fileData = null) {
    const startTime = Date.now();
    
    this.addToContext('user', userInput, fileData);
    this.updateUserProfile(userInput);
    
    let response;
    
    if (fileData) {
      response = await this.handleFileAnalysis(fileData, userInput);
    } else {
      response = await this.handleTextQuery(userInput);
    }
    
    response.processingTime = `${Date.now() - startTime}ms`;
    this.addToContext('agent', response.content);
    
    return response;
  }

  async handleFileAnalysis(fileData, userContext = '') {
    try {
      const detectionResults = await this.detectionEngine.analyzeImage(fileData);
      
      if (!detectionResults.success) {
        return this.handleAnalysisError(detectionResults.error);
      }

      this.analysisHistory.push({
        filename: fileData.name,
        results: detectionResults,
        timestamp: new Date(),
        userContext
      });

      return this.generateAnalysisResponse(detectionResults, fileData, userContext);
      
    } catch (error) {
      return this.handleAnalysisError(error.message);
    }
  }

  async generateAnalysisResponse(results, fileData, userContext) {
    const { confidence, isDeepfake, artifacts, reliability } = results;
    
    try {
      const analysisContent = await this.llmService.generateAnalysisExplanation(
        results, 
        fileData.name, 
        this.userProfile.technicalLevel
      );
      
      return {
        type: 'analysis',
        title: isDeepfake ? '🚨 DEEPFAKE DETECTED' : '✅ AUTHENTIC CONTENT',
        confidence: confidence.toFixed(1),
        isDeepfake,
        content: analysisContent,
        recommendations: this.generateRecommendations(results, userContext),
        followUpQuestions: this.generateFollowUpQuestions(results),
        metadata: results
      };
    } catch (error) {
      return this.generateStaticAnalysisResponse(results, fileData, userContext);
    }
  }

  generateStaticAnalysisResponse(results, fileData, userContext) {
    const { confidence, isDeepfake, artifacts, reliability } = results;
    
    let content = `**Confidence Level:** ${confidence.toFixed(1)}% (${reliability} reliability)\n\n`;
    
    content += `**🎯 Executive Summary:**\n`;
    if (isDeepfake) {
      content += `This content shows ${confidence > 85 ? 'strong' : 'moderate'} indicators of AI manipulation. `;
      content += `Key detection factors include ${artifacts[0].type.toLowerCase()} and ${artifacts[1].type.toLowerCase()}.\n\n`;
    } else {
      content += `This content appears authentic based on comprehensive analysis. `;
      content += `The enhanced detection algorithms found minimal manipulation indicators across all analysis methods. `;
      content += `While no detection is 100% certain, the evidence strongly suggests this is genuine content.\n\n`;
    }

    content += `**🔬 Enhanced Detection Methods Used:**\n\n`;
    
    artifacts.forEach(artifact => {
      content += `**${artifact.type}**\n`;
      content += `• Detection Score: ${artifact.score.toFixed(1)}%\n`;
      content += `• Confidence: ${artifact.confidence.toFixed(1)}%\n`;
      content += `• Analysis: ${artifact.description}\n`;
      content += `• Result: ${this.interpretScore(artifact.score, artifact.type)}\n\n`;
    });
    
    return {
      type: 'analysis',
      title: isDeepfake ? '🚨 DEEPFAKE DETECTED' : '✅ AUTHENTIC CONTENT',
      confidence: confidence.toFixed(1),
      isDeepfake,
      content: content,
      recommendations: this.generateRecommendations(results, userContext),
      followUpQuestions: this.generateFollowUpQuestions(results),
      metadata: results
    };
  }

  async handleTextQuery(userInput) {
    const intent = this.classifyIntent(userInput);
    const response = await this.generateTextResponse(intent, userInput);
    
    return {
      type: response.type || 'conversational',
      content: response.content,
      suggestions: response.suggestions || [],
      followUp: response.followUp
    };
  }

  classifyIntent(input) {
    const lowerInput = input.toLowerCase();
    const patterns = {
      how_detection_works: ['how do you', 'how does', 'detection work', 'algorithm', 'method'],
      accuracy_reliability: ['accurate', 'reliable', 'trust', 'confidence', 'error rate'],
      threat_landscape: ['dangerous', 'threat', 'harmful', 'risk', 'security'],
      help_capabilities: ['help', 'what can', 'capabilities', 'features'],
      technical_details: ['technical', 'implementation', 'model', 'neural', 'ai']
    };
    
    for (const [intent, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general_query';
  }

  async generateTextResponse(intent, userInput) {
    try {
      const context = this.conversationContext.slice(-5).map(ctx => ({
        role: ctx.role === 'agent' ? 'assistant' : 'user',
        content: typeof ctx.content === 'string' ? ctx.content : JSON.stringify(ctx.content)
      }));

      let prompt = userInput;
      let llmIntent = 'conversational';

      switch (intent) {
        case 'how_detection_works':
          prompt = `User wants to understand how enhanced deepfake detection works. They asked: "${userInput}". 
          Technical level: ${this.userProfile.technicalLevel}. 
          Explain the enhanced 6-method detection process, methods, and technology in appropriate detail.`;
          llmIntent = 'educational';
          break;
          
        case 'accuracy_reliability':
          prompt = `User is asking about accuracy and reliability of deepfake detection. They asked: "${userInput}". 
          Technical level: ${this.userProfile.technicalLevel}. 
          Provide detailed performance metrics, benchmarks, and reliability factors for enhanced detection.`;
          llmIntent = 'educational';
          break;
          
        case 'threat_landscape':
          prompt = `User wants to understand deepfake threats and dangers. They asked: "${userInput}". 
          Provide comprehensive threat analysis including attack vectors, impacts, and mitigation strategies.`;
          llmIntent = 'threat_analysis';
          break;
          
        case 'help_capabilities':
          prompt = `User wants to know about enhanced deepfake detection capabilities. They asked: "${userInput}". 
          Explain the advanced features, use cases, and value proposition clearly.`;
          llmIntent = 'conversational';
          break;
      }

      const llmResponse = await this.llmService.generateResponse(prompt, context, llmIntent);
      
      return {
        type: intent === 'help_capabilities' ? 'help' : 'educational',
        content: llmResponse,
        suggestions: this.generateSuggestions(intent),
        followUp: this.generateFollowUp(intent)
      };

    } catch (error) {
      return this.generateHardcodedResponse(intent, userInput);
    }
  }

  generateSuggestions(intent) {
    const suggestions = {
      how_detection_works: [
        "Show me the 6-method analysis in action",
        "What makes the enhanced detection more accurate?",
        "How do you handle challenging cases?"
      ],
      accuracy_reliability: [
        "Test enhanced accuracy with my files",
        "What factors affect detection performance?",
        "How do you calibrate confidence scores?"
      ],
      threat_landscape: [
        "What's the biggest deepfake threat today?",
        "How can organizations protect themselves?",
        "What are emerging deepfake techniques?"
      ],
      help_capabilities: [
        "Analyze a file with enhanced methods",
        "Explain the 6 detection algorithms",
        "What types of deepfakes can you detect?"
      ]
    };
    return suggestions[intent] || [
      "Upload a file for enhanced analysis",
      "Learn about advanced detection methods",
      "Understand latest deepfake threats"
    ];
  }

  generateFollowUp(intent) {
    const followUps = {
      how_detection_works: "Would you like to see the enhanced 6-method analysis in action?",
      accuracy_reliability: "Want to test the improved detection capabilities?",
      threat_landscape: "Do you have specific security concerns about advanced deepfakes?",
      help_capabilities: "What enhanced feature would you like to explore first?"
    };
    return followUps[intent] || "How else can I assist you with advanced deepfake detection?";
  }

  generateHardcodedResponse(intent, userInput) {
    return {
      type: 'conversational',
      content: `I understand you're asking about "${userInput}". As your enhanced deepfake detection specialist, I can help you with comprehensive analysis using 6 advanced detection methods, education about AI security threats, and professional consultation. What specific aspect would you like to explore?`,
      suggestions: [
        "How does enhanced detection work?",
        "Upload a file for 6-method analysis",
        "What makes deepfakes dangerous?"
      ],
      followUp: "How can I best assist you with advanced deepfake detection today?"
    };
  }

  interpretScore(score, type) {
    if (score > 80) return `Strong indicators of manipulation detected`;
    if (score > 60) return `Moderate signs of artificial generation found`;
    if (score > 35) return `Some inconsistencies noted, requires further analysis`;
    if (score > 15) return `Minor irregularities detected, likely authentic`;
    return `No significant manipulation indicators found`;
  }

  generateRecommendations(results, userContext) {
    const recommendations = [];
    
    if (results.isDeepfake) {
      recommendations.push("🚨 **High Priority:** Do not share or distribute this content");
      recommendations.push("🔍 **Verify Source:** Investigate the origin and context of this media");
      recommendations.push("📋 **Document Evidence:** Save analysis results for potential legal proceedings");
      if (results.confidence > 90) {
        recommendations.push("⚖️ **Legal Action:** Consider consulting legal counsel for malicious use");
      }
    } else {
      recommendations.push("✅ **Likely Authentic:** Content appears genuine based on enhanced analysis");
      recommendations.push("🔄 **Cross-Reference:** Verify through additional sources when possible");
      recommendations.push("📈 **Monitor:** Stay alert for variants or manipulated versions");
      if (results.confidence < 30) {
        recommendations.push("⚠️ **Low Confidence:** Consider additional verification methods");
      }
    }
    
    return recommendations;
  }

  generateFollowUpQuestions(results) {
    const questions = [
      "Would you like me to explain any specific detection method in detail?",
      "Do you have questions about the enhanced confidence scoring?",
      "Should I analyze another file for comparison?"
    ];
    
    return questions;
  }

  handleAnalysisError(errorMessage) {
    return {
      type: 'error',
      content: `🚨 **Enhanced Analysis Error**

I encountered an issue: ${errorMessage}

**Troubleshooting Steps:**
- Ensure the file is a valid image or video
- Check that faces are clearly visible and well-lit
- Try with a smaller file size if large (max 50MB)
- Verify the file isn't corrupted
- For best results, use high-resolution images

**Supported Formats:**
- Images: JPG, PNG, WebP, GIF
- Videos: MP4, MOV, WebM, AVI
- Max size: 50MB
- Recommended: 1080p or higher resolution`,
      suggestions: [
        "Try a different high-quality file",
        "What file formats work best?",
        "How can I improve detection accuracy?"
      ]
    };
  }

  updateUserProfile(input) {
    const technicalTerms = ['algorithm', 'neural', 'cnn', 'tensorflow', 'model', 'training', 'dataset', 'ensemble', 'frequency'];
    const basicTerms = ['simple', 'easy', 'basic', 'explain like', 'eli5', 'beginner'];
    
    const lowerInput = input.toLowerCase();
    
    if (technicalTerms.some(term => lowerInput.includes(term))) {
      this.userProfile.technicalLevel = 'advanced';
    } else if (basicTerms.some(term => lowerInput.includes(term))) {
      this.userProfile.technicalLevel = 'basic';
    } else if (this.userProfile.technicalLevel === 'unknown') {
      this.userProfile.technicalLevel = 'intermediate';
    }
  }

  addToContext(role, content, fileData = null) {
    this.conversationContext.push({
      role,
      content,
      fileData: fileData ? { name: fileData.name, type: fileData.type } : null,
      timestamp: new Date()
    });
    
    if (this.conversationContext.length > 20) {
      this.conversationContext = this.conversationContext.slice(-15);
    }
  }
}

export default DeepfakeAgent;