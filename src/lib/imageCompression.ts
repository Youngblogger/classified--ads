export interface CompressedImage {
  file: File;
  preview: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
}

const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const TARGET_SIZE_KB = 300;
const MIN_QUALITY = 0.4;
const MAX_QUALITY = 0.85;

export async function compressImage(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; targetSizeKB?: number }
): Promise<CompressedImage> {
  const maxWidth = options?.maxWidth || MAX_WIDTH;
  const maxHeight = options?.maxHeight || MAX_HEIGHT;
  const targetSizeKB = options?.targetSizeKB || TARGET_SIZE_KB;

  const img = await createImage(file);

  let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);

  let quality = MAX_QUALITY;
  let blob: Blob | null = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    blob = await canvasToBlob(img, width, height, quality);

    if (blob.size <= targetSizeKB * 1024 || quality <= MIN_QUALITY) {
      break;
    }

    quality -= 0.1;
    attempts++;
  }

  if (!blob) {
    throw new Error('Failed to compress image');
  }

  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
    type: 'image/webp',
    lastModified: Date.now(),
  });

  return {
    file: compressedFile,
    preview: URL.createObjectURL(compressedFile),
    width,
    height,
    size: compressedFile.size,
    originalSize: file.size,
  };
}

export async function compressImages(
  files: File[],
  options?: { maxWidth?: number; maxHeight?: number; targetSizeKB?: number }
): Promise<CompressedImage[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

function createImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function canvasToBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      'image/webp',
      quality
    );
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
