import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface StorageUploadResult {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface IStorageService {
  uploadImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId?: string
  ): Promise<StorageUploadResult>;
}

class StorageService implements IStorageService {
  private supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  private supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  private bucketName = process.env.SUPABASE_STORAGE_BUCKET || "writeup-assets";

  async uploadImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId?: string
  ): Promise<StorageUploadResult> {
    // 1. Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error("File exceeds maximum allowed size of 5MB.");
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new Error(
        `Invalid file format: ${mimeType}. Allowed formats: PNG, JPEG, WebP, GIF.`
      );
    }

    // 3. Generate sanitized user-namespaced file key
    const ext = path.extname(originalName).toLowerCase() || ".png";
    const randomHash = crypto.randomBytes(16).toString("hex");
    const userPrefix = userId ? `uploads/${userId}` : "uploads";
    const key = `${userPrefix}/${Date.now()}-${randomHash}${ext}`;

    // 4. If Supabase is configured, upload to Supabase Storage
    if (this.supabaseUrl && this.supabaseServiceKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          this.supabaseUrl,
          this.supabaseServiceKey
        );

        const { error } = await supabase.storage
          .from(this.bucketName)
          .upload(key, buffer, {
            contentType: mimeType,
            upsert: false,
          });

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(key);

        return {
          url: publicUrlData.publicUrl,
          key,
          size: buffer.length,
          mimeType,
        };
      } catch (err) {
        console.warn("Supabase upload failed, falling back to local storage:", err);
      }
    }

    // 5. Fallback: Local filesystem storage under public/uploads
    const localDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(localDir, { recursive: true });

    const localFilename = `${Date.now()}-${randomHash}${ext}`;
    const filePath = path.join(localDir, localFilename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${localFilename}`;

    return {
      url: publicUrl,
      key: `local/${localFilename}`,
      size: buffer.length,
      mimeType,
    };
  }
}

export const storageService = new StorageService();
