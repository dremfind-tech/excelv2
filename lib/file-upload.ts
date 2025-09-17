import { createClient } from '@supabase/supabase-js';
import type { TablePreview, ChartSpec } from '@/types/chart-spec';

export interface FileUpload {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  preview_data?: TablePreview;
  chart_specs?: ChartSpec[];
  prompt?: string;
  created_at: string;
  updated_at: string;
}

export class FileUploadService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  /**
   * Get user profile by email
   */
  async getUserProfile(email: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }

  /**
   * Upload a file and create a database record
   */
  async uploadFile(
    file: File, 
    preview: TablePreview, 
    userId: string
  ): Promise<FileUpload> {
    try {
      console.log('FileUploadService: Starting upload for user:', userId);
      console.log('FileUploadService: File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('FileUploadService: Generated file path:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('uploads')
        .upload(filePath, file);

      console.log('FileUploadService: Storage upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('FileUploadService: Storage upload failed:', uploadError);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Create database record
      const uploadRecord = {
        user_id: userId,
        filename: fileName,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: filePath,
        preview_data: preview,
      };

      console.log('FileUploadService: Inserting database record:', uploadRecord);

      const { data: record, error: dbError } = await this.supabase
        .from('uploads')
        .insert(uploadRecord)
        .select()
        .single();

      console.log('FileUploadService: Database insert result:', { record, dbError });

      if (dbError) {
        console.error('FileUploadService: Database insert failed:', dbError);
        // Clean up uploaded file if database insert fails
        await this.supabase.storage.from('uploads').remove([filePath]);
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      console.log('FileUploadService: Upload completed successfully');
      return record;
    } catch (error) {
      console.error('FileUploadService: Upload error:', error);
      throw error;
    }
  }

  /**
   * Get all uploads for a user
   */
  async getUserUploads(userId: string): Promise<FileUpload[]> {
    const { data, error } = await this.supabase
      .from('uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch uploads: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific upload by ID
   */
  async getUpload(uploadId: string, userId: string): Promise<FileUpload | null> {
    const { data, error } = await this.supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch upload: ${error.message}`);
    }

    return data;
  }

  /**
   * Update chart specs for an upload
   */
  async updateChartSpecs(
    uploadId: string, 
    userId: string, 
    chartSpecs: ChartSpec[], 
    prompt?: string
  ): Promise<FileUpload> {
    const { data, error } = await this.supabase
      .from('uploads')
      .update({
        chart_specs: chartSpecs,
        prompt: prompt || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', uploadId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chart specs: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete an upload and its associated file
   */
  async deleteUpload(uploadId: string, userId: string): Promise<void> {
    // First get the upload to know the storage path
    const upload = await this.getUpload(uploadId, userId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from('uploads')
      .remove([upload.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await this.supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', userId);

    if (dbError) {
      throw new Error(`Failed to delete upload: ${dbError.message}`);
    }
  }

  /**
   * Get download URL for a file
   */
  async getDownloadUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('uploads')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      throw new Error(`Failed to create download URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Get file content as ArrayBuffer (for processing)
   */
  async getFileContent(storagePath: string): Promise<ArrayBuffer> {
    const { data, error } = await this.supabase.storage
      .from('uploads')
      .download(storagePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return data.arrayBuffer();
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();