import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EntryType } from './entry-type.enum';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';

// Storage configuration for file uploads
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('sessions/:sessionId/entries')
@UseGuards(JwtAuthGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  create(@Param('sessionId') sessionId: string, @Body() createEntryDto: CreateEntryDto) {
    // Ensure the sessionId from the route is used
    createEntryDto.sessionId = sessionId;
    return this.entriesService.create(createEntryDto);
  }

  @Post('mixed-media')
  async createMixedMediaEntry(
    @Param('sessionId') sessionId: string,
    @Body() payload: {
      text?: string;
      photoUrl?: string;
      audioUrl?: string;
      createdById?: string;
    }
  ) {
    // Handle case where we have multiple media types in one entry
    if (payload.text && payload.photoUrl && payload.audioUrl) {
      // Create main text entry with all content
      const textEntry = await this.entriesService.create({
        type: EntryType.NOTE,
        originalMessage: payload.text,
        cleanedMessage: payload.text, // Could be processed with AI in the future
        photoUrl: payload.photoUrl,
        audioUrl: payload.audioUrl,
        sessionId,
        createdById: payload.createdById,
      });
      
      return textEntry;
    } 
    else if (payload.audioUrl) {
      // If there's voice recording, we'll want to transcribe it
      // For now, create an entry with the voice recording
      // In the future, this could trigger a background job to transcribe
      const voiceEntry = await this.entriesService.create({
        type: EntryType.VOICE_NOTE,
        audioUrl: payload.audioUrl,
        originalMessage: payload.text || "Voice recording", // Default message
        sessionId,
        createdById: payload.createdById,
      });
      
      return voiceEntry;
    }
    else if (payload.photoUrl) {
      // Create a photo entry with optional caption
      const photoEntry = await this.entriesService.create({
        type: EntryType.PHOTO,
        photoUrl: payload.photoUrl,
        originalMessage: payload.text || "Photo", // Text serves as caption
        sessionId,
        createdById: payload.createdById,
      });
      
      return photoEntry;
    }
    else if (payload.text) {
      // Simple text note
      const textEntry = await this.entriesService.create({
        type: EntryType.NOTE,
        originalMessage: payload.text,
        cleanedMessage: payload.text, // Could be processed with AI
        sessionId,
        createdById: payload.createdById,
      });
      
      return textEntry;
    }
    
    // Fallback for empty requests
    throw new Error("Entry must contain at least one of: text, photo, or audio");
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadMediaEntry(
    @Param('sessionId') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { text?: string; createdById?: string; }
  ) {
    if (!file) {
      throw new Error('File is required');
    }

    // Determine file type from mimetype
    let entryType: EntryType;
    
    // Use port 4005 and /api path in the URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:4005';
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;
    
    if (file.mimetype.startsWith('image/')) {
      entryType = EntryType.PHOTO;
      
      // For photos, create entry with AI-processed content
      const aiProcessedText = await this.entriesService.processImageWithAI(file.path);
      
      return this.entriesService.create({
        type: entryType,
        originalMessage: body.text || 'Photo uploaded',
        cleanedMessage: aiProcessedText, // AI-generated description
        photoUrl: fileUrl,
        sessionId,
        createdById: body.createdById,
      });
    } 
    else if (file.mimetype.startsWith('audio/')) {
      entryType = EntryType.VOICE_NOTE;
      
      // For voice recordings, transcribe and process
      return this.entriesService.createVoiceNoteWithTranscription(
        sessionId,
        fileUrl,
        body.createdById
      );
    }
    else {
      // For other file types, just create a generic note
      return this.entriesService.create({
        type: EntryType.NOTE,
        originalMessage: body.text || 'File uploaded',
        photoUrl: file.mimetype.startsWith('image/') ? fileUrl : undefined,
        audioUrl: file.mimetype.startsWith('audio/') ? fileUrl : undefined,
        sessionId,
        createdById: body.createdById,
      });
    }
  }

  @Get()
  findAll(@Param('sessionId') sessionId: string) {
    return this.entriesService.findAll(sessionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entriesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entriesService.remove(id);
  }
}