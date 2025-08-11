import axios from 'axios';
import { injectable } from 'inversify';

@injectable()
export class OllamaService {
  private baseUrl: string;

  constructor() {
    const ollamaHost = process.env.AI_SERVER_IP || 'localhost';
    this.baseUrl = `http://${ollamaHost}:11434`; // Ollama server URL (TODO: make it configurable)
    
    console.log(`OllamaService initialized with baseUrl: ${this.baseUrl}`);
  }

  /**
   * Generate text using Ollama model
   * @param model The model to use (e.g., 'llama2', 'mistral', etc.)
   * @param prompt The prompt to send to the model
   * @param options Additional options for the generation
   * @returns The generated text
   */
  async generateText(model: string, prompt: string, options: any = {}): Promise<string> {
    try {
      console.log(`Generating text with model: ${model}`);
      
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model,
        prompt,
        ...options,
      });

      return response.data.response;
    } catch (error) {
      console.error('Error generating text with Ollama:', error);
      throw new Error(`Failed to generate text: ${error.message}`);
    }
  }

  /**
   * Generate poll questions using Ollama
   * @param topic The topic to generate questions about
   * @param count Number of questions to generate
   * @param model The model to use
   * @returns Array of generated questions with options
   */
  async generatePollQuestions(topic: string, count: number = 3, model: string = 'llama2'): Promise<any[]> {
    try {
      const prompt = `Generate ${count} multiple choice poll questions about ${topic}. 
      Format the response as a JSON array with each question having the following structure:
      {
        "question": "The question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctOption": 0 // Index of the correct option (0-based)
      }
      Only return the JSON array, nothing else.`;

      const response = await this.generateText(model, prompt, {
        temperature: 0.7,
        max_tokens: 1000,
      });

      try {
        const jsonMatch = response.match(/\[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing Ollama response:', parseError);
        throw new Error(`Failed to parse Ollama response: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Error generating poll questions:', error);
      throw new Error(`Failed to generate poll questions: ${error.message}`);
    }
  }

  /**
   * Check if Ollama service is available
   * @returns True if Ollama is available, false otherwise
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/version`);
      return response.status === 200;
    } catch (error) {
      console.error('Ollama service is not available:', error);
      return false;
    }
  }

  /**
   * List available models in Ollama
   * @returns Array of available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models.map(model => model.name);
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      throw new Error(`Failed to list models: ${error.message}`);
    }
  }
}
