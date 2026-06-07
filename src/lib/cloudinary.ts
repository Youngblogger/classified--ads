import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options?: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'auto';
    transformation?: Record<string, unknown>[];
  }
): Promise<CloudinaryUploadResult> {
  const folder = options?.folder || 'classified-ads';
  const resource_type = options?.resource_type || 'auto';

  const baseTransforms: Record<string, unknown>[] = [
    { quality: 'auto' },
    { fetch_format: 'auto' },
  ];

  const allTransforms = options?.transformation
    ? [...baseTransforms, ...options.transformation]
    : baseTransforms;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: options?.public_id,
        resource_type,
        transformation: allTransforms,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed: no result'));

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId);
}

export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    crop?: string;
    gravity?: string;
  }
): string {
  const transformations: string[] = [];

  if (options?.width && options?.height) {
    transformations.push(`w_${options.width},h_${options.height},c_${options?.crop || 'fill'},g_${options?.gravity || 'auto'}`);
  } else if (options?.width) {
    transformations.push(`w_${options.width}`);
  } else if (options?.height) {
    transformations.push(`h_${options.height}`);
  }

  transformations.push(`q_${options?.quality || 'auto'}`);
  transformations.push('f_auto');

  const transformation = transformations.join(',');

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
}

export function getThumbnailUrl(publicId: string, width = 400, height = 300): string {
  return getOptimizedImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: '80',
  });
}
