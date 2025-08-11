import {
  JsonController,
  Post,
  Get,
  Body,
  HttpCode,
  Res,
  QueryParam
} from 'routing-controllers';
import { injectable, inject } from 'inversify';
import { Response } from 'express';
import { OllamaService } from '../services/OllamaService.js';
import { GENAI_TYPES } from '../types.js';

@injectable()
@JsonController('/ollama')
export class OllamaController {
  constructor(
    @inject(GENAI_TYPES.OllamaService) private ollamaService: OllamaService
  ) {}

  @Get('/status')
  @HttpCode(200)
  async getStatus(@Res() res: Response) {
    try {
      const isAvailable = await this.ollamaService.isAvailable();
      return res.json({
        status: isAvailable ? 'available' : 'unavailable',
        message: isAvailable 
          ? 'Ollama service is available' 
          : 'Ollama service is not available'
      });
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to check Ollama service status'
      });
    }
  }

  @Get('/models')
  @HttpCode(200)
  async getModels(@Res() res: Response) {
    try {
      const models = await this.ollamaService.listModels();
      return res.json({
        models
      });
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to list Ollama models'
      });
    }
  }

  @Post('/generate/text')
  @HttpCode(200)
  async generateText(
    @Body() body: { model: string; prompt: string; options?: any },
    @Res() res: Response
  ) {
    try {
      const { model, prompt, options } = body;
      
      if (!model || !prompt) {
        return res.status(400).json({
          status: 'error',
          message: 'Model and prompt are required'
        });
      }

      const response = await this.ollamaService.generateText(model, prompt, options);
      
      return res.json({
        status: 'success',
        response
      });
    } catch (error) {
      console.error('Error generating text with Ollama:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate text'
      });
    }
  }

  @Post('/generate/poll-questions')
  @HttpCode(200)
  async generatePollQuestions(
    @Body() body: { topic: string; count?: number; model?: string },
    @Res() res: Response
  ) {
    try {
      const { topic, count = 3, model = 'llama2' } = body;
      
      if (!topic) {
        return res.status(400).json({
          status: 'error',
          message: 'Topic is required'
        });
      }

      const questions = await this.ollamaService.generatePollQuestions(topic, count, model);
      
      return res.json({
        status: 'success',
        questions
      });
    } catch (error) {
      console.error('Error generating poll questions with Ollama:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to generate poll questions'
      });
    }
  }
}
