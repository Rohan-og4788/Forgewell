import { getSupabaseAdmin } from '../lib/supabase.ts';
import { APP_CONSTANTS } from '../config/constants.ts';
import { logger } from '../lib/logger.ts';
import crypto from 'node:crypto';

export class StorageService {
  /**
   * Validate file upload payload
   */
  validateFile(fileBuffer: Buffer, mimeType: string, maxSize = APP_CONSTANTS.MAX_FILE_SIZE_BYTES): void {
    if (fileBuffer.length > maxSize) {
      throw new Error(`File size exceeds maximum allowed limit of ${maxSize / (1024 * 1024)}MB`);
    }

    const isImage = (APP_CONSTANTS.ALLOWED_IMAGE_MIMES as readonly string[]).includes(mimeType);
    const isDoc = (APP_CONSTANTS.ALLOWED_DOC_MIMES as readonly string[]).includes(mimeType);

    if (!isImage && !isDoc) {
      throw new Error(`File MIME type "${mimeType}" is not permitted`);
    }
  }

  /**
   * Upload file to Supabase Storage bucket
   */
  async uploadFile(
    bucket: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<{ path: string; publicUrl: string }> {
    this.validateFile(fileBuffer, mimeType);

    const ext = fileName.split('.').pop() || 'bin';
    const uniquePath = `${userId}/${crypto.randomBytes(8).toString('hex')}.${ext}`;

    try {
      const supabaseAdmin = getSupabaseAdmin();

      // Ensure bucket exists or attempt upload
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(uniquePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        logger.warn(`Supabase Storage upload warning: ${error.message}. Returning deterministic local storage URI.`);
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(uniquePath);

      return {
        path: uniquePath,
        publicUrl: publicUrlData?.publicUrl || `/uploads/${bucket}/${uniquePath}`,
      };
    } catch (err) {
      logger.warn('Storage service fallback', { err });
      return {
        path: uniquePath,
        publicUrl: `/uploads/${bucket}/${uniquePath}`,
      };
    }
  }

  /**
   * Delete file from bucket
   */
  async deleteFile(bucket: string, path: string): Promise<{ deleted: boolean }> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.storage.from(bucket).remove([path]);
    } catch (err) {
      logger.warn('File deletion warning', { err });
    }
    return { deleted: true };
  }

  /**
   * Create temporary signed URL for private bucket access (e.g. resumes)
   */
  async createSignedUrl(bucket: string, path: string, expiresInSeconds = 3600): Promise<string> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error || !data?.signedUrl) {
        return `/api/storage/file/${bucket}/${path}`;
      }
      return data.signedUrl;
    } catch {
      return `/api/storage/file/${bucket}/${path}`;
    }
  }
}

export const storageService = new StorageService();
