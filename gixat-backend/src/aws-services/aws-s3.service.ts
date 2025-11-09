import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client | null = null;
  private bucketName: string | null = null;

  constructor() {
    this.initializeS3Client();
  }

  private initializeS3Client(): void {
    // Make AWS optional - only initialize if all credentials are provided
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME) {
      console.warn('⚠️ AWS S3 configuration is incomplete. S3 features will be disabled.');
      console.warn('Required env variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME');
      return;
    }

    try {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.bucketName = process.env.AWS_BUCKET_NAME;
      console.log('✅ S3Client initialized with region:', process.env.AWS_REGION);
      console.log('✅ S3 Bucket:', process.env.AWS_BUCKET_NAME);
    } catch (error) {
      console.error('❌ Failed to initialize S3Client:', error);
      throw error;
    }
  }

  private getS3Client(): S3Client {
    if (!this.s3Client) {
      this.initializeS3Client();
    }
    if (!this.s3Client) {
      throw new InternalServerErrorException('S3 client not configured. Please check AWS credentials.');
    }
    return this.s3Client;
  }

  private getBucketName(): string {
    if (!this.bucketName) {
      this.initializeS3Client();
    }
    if (!this.bucketName) {
      throw new InternalServerErrorException('S3 bucket not configured. Please check AWS credentials.');
    }
    return this.bucketName;
  }

  async uploadInspectionMedia(file: Buffer, originalName: string, inspectionId: number, businessId: number): Promise<string> {
    try {
      // Sanitize original filename and generate unique filename
      const sanitizedName = this.sanitizeFilename(originalName);
      const fileExtension = sanitizedName.split('.').pop() || 'jpg';
      const baseFileName = sanitizedName.replace(/\.[^/.]+$/, ''); // Remove extension
      const fileName = `inspections/business-${businessId}/inspection-${inspectionId}/${uuidv4()}-${baseFileName}.${fileExtension}`;

      console.log('☁️ Uploading inspection media to S3:', fileName);

      const command = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key: fileName,
        Body: file,
        ContentType: this.getContentType(fileExtension),
        Metadata: {
          originalname: this.sanitizeFilename(originalName), // AWS metadata keys must be lowercase
          inspectionid: inspectionId.toString(),
          businessid: businessId.toString(),
          uploadedat: new Date().toISOString(),
          type: 'inspection-media'
        },
      });

      await this.getS3Client().send(command);

      // Return the S3 URL
      const s3Url = `https://${this.getBucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      console.log('✅ Inspection media uploaded to S3:', s3Url);

      return s3Url;
    } catch (error) {
      console.error('❌ Failed to upload inspection media to S3:', error);
      throw new InternalServerErrorException('Failed to upload inspection media to S3');
    }
  }

  async uploadBusinessLogo(file: Buffer, originalName: string, businessId: number): Promise<string> {
    try {
      const sanitizedName = this.sanitizeFilename(originalName);
      const fileExtension = sanitizedName.split('.').pop() || 'jpg';
      const fileName = `business-logos/business-${businessId}/logo-${uuidv4()}.${fileExtension}`;

      console.log('☁️ Uploading business logo to S3:', fileName);

      const command = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key: fileName,
        Body: file,
        ContentType: this.getContentType(fileExtension),
        Metadata: {
          originalname: this.sanitizeFilename(originalName),
          businessid: businessId.toString(),
          uploadedat: new Date().toISOString(),
          type: 'business-logo'
        },
      });

      await this.getS3Client().send(command);

      const s3Url = `https://${this.getBucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      console.log('✅ Business logo uploaded to S3:', s3Url);

      return s3Url;
    } catch (error) {
      console.error('❌ Failed to upload business logo to S3:', error);
      throw new InternalServerErrorException('Failed to upload business logo to S3');
    }
  }

  async uploadFile(file: Buffer, fileName: string, folder: string = 'files'): Promise<string> {
    try {
      // Sanitize filename to remove spaces and special characters
      const sanitizedFileName = this.sanitizeFilename(fileName);
      const key = `${folder}/${uuidv4()}-${sanitizedFileName}`;

      // Determine content type from file extension
      const fileExtension = sanitizedFileName.split('.').pop()?.toLowerCase() || '';
      const contentType = this.getContentType(fileExtension);

      console.log('☁️ Uploading file to S3:', key);

      const command = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.getS3Client().send(command);

      // Return the S3 URL
      const s3Url = `https://${this.getBucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log('✅ File uploaded to S3:', s3Url);

      return s3Url;
    } catch (error) {
      console.error('❌ Failed to upload file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async getFileBuffer(s3Url: string): Promise<Buffer> {
    try {
      // Extract key from S3 URL
      const key = this.extractKeyFromUrl(s3Url);

      console.log('📥 Downloading file from S3:', key);

      const command = new GetObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
      });

      const response = await this.getS3Client().send(command);

      if (!response.Body) {
        throw new Error('Empty response body');
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      const stream = response.Body as any;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      console.log('✅ File downloaded from S3, size:', buffer.length, 'bytes');

      return buffer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to download file from S3:', error);
      throw new InternalServerErrorException(`Failed to download file from S3: ${errorMessage}`);
    }
  }

  async generatePresignedUrl(s3Url: string, expiresIn: number = 3600): Promise<string> {
    try {
      const key = this.extractKeyFromUrl(s3Url);

      const command = new GetObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.getS3Client(), command, {
        expiresIn, // Default 1 hour
      });

      console.log('🔗 Generated presigned URL for:', key);
      return presignedUrl;
    } catch (error) {
      console.error('❌ Failed to generate presigned URL:', error);
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }

  async deleteFile(s3Url: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(s3Url);

      console.log('🗑️ Deleting file from S3:', key);

      const command = new DeleteObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
      });

      await this.getS3Client().send(command);
      console.log('✅ File deleted from S3:', key);
    } catch (error) {
      console.error('❌ Failed to delete file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  extractKeyFromUrl(s3Url: string): string {
    // Extract key from S3 URL
    // Format: https://bucket-name.s3.region.amazonaws.com/key
    const url = new URL(s3Url);
    return url.pathname.substring(1); // Remove leading slash
  }

  /**
   * Sanitize filename by removing/replacing spaces and special characters
   * Ensures S3 URLs are valid and don't require URL encoding
   */
  private sanitizeFilename(filename: string): string {
    // Remove leading/trailing spaces
    let sanitized = filename.trim();
    
    // Replace spaces with hyphens
    sanitized = sanitized.replace(/\s+/g, '-');
    
    // Remove special characters except dots, hyphens, and underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9.-_]/g, '');
    
    // Replace multiple consecutive hyphens with a single hyphen
    sanitized = sanitized.replace(/-+/g, '-');
    
    // Remove leading/trailing hyphens
    sanitized = sanitized.replace(/^-+|-+$/g, '');
    
    // Ensure filename is not empty
    if (!sanitized || sanitized === '.') {
      sanitized = `file-${Date.now()}`;
    }
    
    console.log(`📝 Sanitized filename: "${filename}" → "${sanitized}"`);
    
    return sanitized;
  }

  private getContentType(fileExtension: string): string {
    const extension = fileExtension?.toLowerCase();
    switch (extension) {
      // Documents
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      
      // Images (common for car inspections)
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      case 'bmp':
        return 'image/bmp';
      case 'tiff':
      case 'tif':
        return 'image/tiff';
      
      // Videos (important for car inspection documentation)
      case 'mp4':
        return 'video/mp4';
      case 'avi':
        return 'video/x-msvideo';
      case 'mov':
        return 'video/quicktime';
      case 'wmv':
        return 'video/x-ms-wmv';
      case 'flv':
        return 'video/x-flv';
      case 'webm':
        return 'video/webm';
      case 'mkv':
        return 'video/x-matroska';
      case '3gp':
        return 'video/3gpp';
      
      // Audio (for voice notes during inspections)
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'ogg':
        return 'audio/ogg';
      case 'aac':
        return 'audio/aac';
      case 'm4a':
        return 'audio/mp4';
      
      default:
        return 'application/octet-stream';
    }
  }

  isS3Url(url: string): boolean {
    return url.includes('amazonaws.com') || url.includes('s3.');
  }

  /**
   * Health check method to verify S3 connection and bucket access
   */
  async healthCheck(): Promise<{
    status: string;
    message: string;
    bucket: string | null;
    region: string | null;
    timestamp: string;
    details?: {
      objectCount: number;
      sampleObjects: Array<{
        key: string;
        size: number;
        lastModified: string;
      }>;
      error?: string;
    };
  }> {
    try {
      if (!this.s3Client || !this.bucketName) {
        return {
          status: 'error',
          message: 'S3 client not configured',
          bucket: null,
          region: null,
          timestamp: new Date().toISOString(),
        };
      }

      // Try to access the bucket
      const headBucketCommand = new HeadBucketCommand({
        Bucket: this.bucketName,
      });

      await this.s3Client.send(headBucketCommand);

      // Try to list objects (limited to 5 to keep it fast)
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 5,
      });

      const listResponse = await this.s3Client.send(listCommand);

      return {
        status: 'success',
        message: 'S3 connection is healthy',
        bucket: this.bucketName,
        region: process.env.AWS_REGION || null,
        timestamp: new Date().toISOString(),
        details: {
          objectCount: listResponse.KeyCount || 0,
          sampleObjects: listResponse.Contents?.slice(0, 3).map(obj => ({
            key: obj.Key || '',
            size: obj.Size || 0,
            lastModified: obj.LastModified?.toISOString() || '',
          })) || [],
        },
      };
    } catch (error) {
      console.error('❌ S3 health check failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        bucket: this.bucketName,
        region: process.env.AWS_REGION || null,
        timestamp: new Date().toISOString(),
        details: {
          objectCount: 0,
          sampleObjects: [],
          error: error instanceof Error ? error.name : 'UnknownError',
        },
      };
    }
  }
}
