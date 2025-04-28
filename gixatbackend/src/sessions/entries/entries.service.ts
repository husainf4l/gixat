import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { EntryType } from './entry-type.enum';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async create(createEntryDto: CreateEntryDto) {
    return this.prisma.sessionEntry.create({
      data: {
        type: createEntryDto.type,
        originalMessage: createEntryDto.originalMessage,
        cleanedMessage: createEntryDto.cleanedMessage,
        photoUrl: createEntryDto.photoUrl,
        audioUrl: createEntryDto.audioUrl,
        createdById: createEntryDto.createdById,
        session: {
          connect: { id: createEntryDto.sessionId }
        }
      }
    });
  }

  async transcribeVoiceNote(audioUrl: string): Promise<string> {
    // This is a placeholder for actual voice transcription logic
    // In a real implementation, you would integrate with a service like:
    // - OpenAI Whisper API
    // - Google Cloud Speech-to-Text
    // - AWS Transcribe
    
    try {
      console.log(`Transcribing audio from: ${audioUrl}`);
      
      // If you're using OpenAI Whisper API:
      // First, download the audio file if it's a URL
      // const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      // const audioBuffer = Buffer.from(response.data, 'binary');
      // const tempFilePath = path.join('./temp', `temp-audio-${Date.now()}.mp3`);
      // fs.writeFileSync(tempFilePath, audioBuffer);
      
      // Then call the OpenAI API
      // const { Configuration, OpenAIApi } = require("openai");
      // const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
      // const openai = new OpenAIApi(configuration);
      // const transcription = await openai.createTranscription(
      //   fs.createReadStream(tempFilePath),
      //   "whisper-1"
      // );
      // 
      // // Clean up the temp file
      // fs.unlinkSync(tempFilePath);
      // 
      // return transcription.data.text;
      
      // For now, return a placeholder
      return "This is a placeholder for transcribed text from voice recording. In production, this would be actual transcribed content.";
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return "Failed to transcribe audio. Please check the recording.";
    }
  }

  /**
   * Process an image with AI to generate a description or extract text
   * @param imagePath Path to the uploaded image
   * @returns AI-generated description or extracted text
   */
  async processImageWithAI(imagePath: string): Promise<string> {
    try {
      console.log(`Processing image with AI: ${imagePath}`);
      
      // In a real implementation, you could use:
      // 1. OpenAI Vision API for image description
      // 2. Google Cloud Vision API for OCR/text extraction
      // 3. Azure Computer Vision for both
      
      // Example with OpenAI Vision API (commented out):
      /*
      const { Configuration, OpenAIApi } = require("openai");
      const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
      const openai = new OpenAIApi(configuration);
      
      // Read the image file as base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      const response = await openai.createChatCompletion({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe what you see in this image related to a vehicle or garage service." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 300
      });
      
      return response.data.choices[0].message.content;
      */
      
      // For now, return a placeholder response
      return "AI image analysis: This appears to be a photo related to a vehicle service. In production, this would be a detailed description of the vehicle part or issue shown in the image.";
    } catch (error) {
      console.error('Error processing image with AI:', error);
      return "Failed to analyze image. Please add a description manually.";
    }
  }

  async findAll(sessionId: string) {
    return this.prisma.sessionEntry.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.sessionEntry.findUnique({
      where: { id }
    });
  }

  async remove(id: string) {
    return this.prisma.sessionEntry.delete({
      where: { id }
    });
  }

  // Method to create an entry from a voice note with transcription
  async createVoiceNoteWithTranscription(
    sessionId: string, 
    audioUrl: string, 
    createdById?: string
  ) {
    // 1. Attempt to transcribe the voice note
    const transcribedText = await this.transcribeVoiceNote(audioUrl);
    
    // 2. Create the entry with both the audio URL and the transcribed text
    return this.create({
      type: EntryType.VOICE_NOTE,
      audioUrl,
      originalMessage: transcribedText,
      cleanedMessage: transcribedText, // Could be further processed/cleaned
      sessionId,
      createdById
    });
  }
}