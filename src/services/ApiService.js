class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  // Upload and analyze file
  async uploadAndAnalyzeFile(file, progressCallback) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress updates
      if (progressCallback) {
        progressCallback('Uploading file to cloud...', 10);
        await this.sleep(500);
        progressCallback('Initializing detection algorithms...', 25);
        await this.sleep(500);
        progressCallback('Running facial landmark analysis...', 40);
        await this.sleep(800);
        progressCallback('Analyzing edge artifacts...', 55);
        await this.sleep(700);
        progressCallback('Processing texture patterns...', 70);
        await this.sleep(600);
        progressCallback('Frequency domain analysis...', 85);
        await this.sleep(500);
        progressCallback('Finalizing results...', 95);
        await this.sleep(300);
        progressCallback('Analysis complete', 100);
      }

      // Mock response for demonstration (replace with actual API call)
      const mockResponse = this.generateMockResponse(file);
      return mockResponse;

      // Uncomment this for real API integration:
      /*
      const response = await fetch(`${this.baseUrl}/api/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let the browser set it
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
      */

    } catch (error) {
      console.error('API Service Error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  // Helper function to simulate async delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate mock response for demonstration
  generateMockResponse(file) {
    const isVideo = file.type.startsWith('video/');
    const randomFactor = Math.random();
    
    // Simulate different deepfake detection scenarios
    const isDeepfake = randomFactor > 0.7; // 30% chance of deepfake
    const baseConfidence = isDeepfake ? 0.75 + (randomFactor * 0.2) : 0.15 + (randomFactor * 0.3);
    
    return {
      detection_result: {
        is_deepfake: isDeepfake,
        confidence: baseConfidence,
        processing_time: 2.5 + (randomFactor * 2),
        analysis_methods: {
          facial_landmarks: {
            confidence: isDeepfake ? 0.8 + (randomFactor * 0.15) : 0.1 + (randomFactor * 0.25),
            details: isDeepfake 
              ? "Facial landmark inconsistencies detected in key facial regions"
              : "Facial landmarks show natural variation patterns"
          },
          edge_artifacts: {
            confidence: isDeepfake ? 0.75 + (randomFactor * 0.2) : 0.05 + (randomFactor * 0.2),
            details: isDeepfake 
              ? "Edge artifacts indicate artificial generation patterns"
              : "Natural edge characteristics observed throughout image"
          },
          texture_analysis: {
            confidence: isDeepfake ? 0.7 + (randomFactor * 0.25) : 0.1 + (randomFactor * 0.3),
            details: isDeepfake 
              ? "Texture patterns show signs of neural network generation"
              : "Texture analysis reveals authentic photographic characteristics"
          },
          frequency_domain: {
            confidence: isDeepfake ? 0.65 + (randomFactor * 0.3) : 0.12 + (randomFactor * 0.28),
            details: isDeepfake 
              ? "Frequency analysis reveals artificial generation signatures"
              : "Frequency domain analysis shows natural image characteristics"
          },
          eye_movement: {
            confidence: isDeepfake ? 0.72 + (randomFactor * 0.23) : 0.08 + (randomFactor * 0.22),
            details: isDeepfake 
              ? "Eye movement patterns indicate synthetic generation"
              : "Natural eye movement and gaze patterns detected"
          },
          lighting_analysis: {
            confidence: isDeepfake ? 0.68 + (randomFactor * 0.27) : 0.15 + (randomFactor * 0.25),
            details: isDeepfake 
              ? "Lighting inconsistencies suggest artificial composition"
              : "Lighting analysis shows consistent natural illumination"
          }
        },
        file_metadata: {
          size_bytes: file.size,
          dimensions: isVideo ? "1920x1080" : "1920x1080",
          total_frames: isVideo ? Math.floor(150 + randomFactor * 300) : null,
          analyzed_frames: isVideo ? Math.floor(50 + randomFactor * 100) : null
        }
      }
    };
  }

  // Additional API methods can be added here
  async getAnalysisHistory() {
    // Mock implementation
    return {
      analyses: [],
      total: 0
    };
  }

  async deleteAnalysis(analysisId) {
    // Mock implementation
    return { success: true };
  }
}

export default ApiService; 