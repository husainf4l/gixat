// WiddPost API service for handling interactions with the widdpost API
import { env } from "@/config/env";

export interface WiddPostResponse {
  status: "success" | "error" | "loading";
  content?: string;
  hashtags?: string[];
  mood?: string;
  generatedAt?: string;
  imageUrl?: string; // Keeping this in case it's added back later
  message?: string;
}

export class WiddPostService {
  /**
   * Send captured photo to the widdpost API with mood and hints
   * @param imageFile The captured image file
   * @param mood The selected mood for the post
   * @param hints Additional context or hints for the post content
   * @returns A response containing generated content and image URL
   */
  async createPost(
    imageFile: File,
    mood: string,
    hints: string
  ): Promise<WiddPostResponse> {
    try {
      // Convert the image File to base64 encoding
      const base64Image = await this.convertFileToBase64(imageFile);
      
      // Create the payload in the format expected by the API
      const payload = {
        image: base64Image,
        mood: mood,
        hints: hints
      };

      // Send to the widdpost API endpoint using the API URL from environment
      const response = await fetch(`${env.apiUrl}/widdpost/generate`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        status: "success",
        content: data.postText, // Map postText to content for UI compatibility
        hashtags: data.hashtags,
        mood: data.mood,
        generatedAt: data.generatedAt,
        message: "Post created successfully!",
      };
    } catch (error) {
      console.error("Error sending to widdpost API:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to create post",
      };
    }
  }

  /**
   * Convert a File object to a base64 encoded string
   * @param file The file to convert
   * @returns A Promise that resolves to the base64 string
   */
  private async convertFileToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

// Export a singleton instance of the service
export const widdPostService = new WiddPostService();