import { useState, useCallback } from 'react';
import axios from 'axios';
import { getAuthToken } from '@/lib/cookies';
import { compressImage, CompressedImage } from './imageCompression';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  thumbnail_url: string;
  optimized_url: string;
  blur_url: string;
}

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface UseCloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
  onSuccess?: (result: CloudinaryUploadResult) => void;
  onError?: (error: string) => void;
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  targetSizeKB?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function useCloudinaryUpload(options: UseCloudinaryUploadOptions = {}) {
  const {
    folder = 'default',
    tags = [],
    onProgress,
    onSuccess,
    onError,
    compress = true,
    maxWidth = 1024,
    maxHeight = 1024,
    targetSizeKB = 300,
  } = options;

  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  const getSignedParams = useCallback(async (): Promise<any> => {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/cloudinary/upload-params`, {
      params: { folder, tags: tags.length > 0 ? tags : undefined },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data.data;
  }, [folder, tags]);

  const uploadToCloudinary = useCallback(
    async (file: File, signedParams: any): Promise<CloudinaryUploadResult> => {
      const formData = new FormData();
      formData.append('file', file);

      Object.entries(signedParams.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await axios.post(signedParams.upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setState((prev) => ({ ...prev, progress }));
            onProgress?.(progress);
          }
        },
      });

      const cloudinaryResult = response.data;

      const callbackResponse = await axios.post(
        `${API_BASE_URL}/cloudinary/upload-callback`,
        {
          public_id: cloudinaryResult.public_id,
          secure_url: cloudinaryResult.secure_url,
          url: cloudinaryResult.url,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          bytes: cloudinaryResult.bytes,
          folder,
        },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      return callbackResponse.data.data;
    },
    [folder, onProgress]
  );

  const upload = useCallback(
    async (file: File): Promise<CloudinaryUploadResult | null> => {
      setState({ uploading: true, progress: 0, error: null });

      try {
        let fileToUpload = file;

        if (compress) {
          const compressed: CompressedImage = await compressImage(file, {
            maxWidth,
            maxHeight,
            targetSizeKB,
          });
          fileToUpload = compressed.file;
        }

        const { upload_url, params } = await getSignedParams();

        const formData = new FormData();
        formData.append('file', fileToUpload);

        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });

        const response = await axios.post(upload_url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setState((prev) => ({ ...prev, progress }));
              onProgress?.(progress);
            }
          },
        });

        const cloudinaryResult: CloudinaryUploadResult = {
          public_id: response.data.public_id,
          secure_url: response.data.secure_url,
          url: response.data.url,
          width: response.data.width,
          height: response.data.height,
          format: response.data.format,
          bytes: response.data.bytes,
          thumbnail_url: response.data.eager?.[0]?.secure_url || '',
          optimized_url: response.data.secure_url,
          blur_url: '',
        };

        await axios.post(
          `${API_BASE_URL}/cloudinary/upload-callback`,
          {
            public_id: cloudinaryResult.public_id,
            secure_url: cloudinaryResult.secure_url,
            url: cloudinaryResult.url,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            format: cloudinaryResult.format,
            bytes: cloudinaryResult.bytes,
            folder,
          },
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );

        setState({ uploading: false, progress: 100, error: null });
        onSuccess?.(cloudinaryResult);
        return cloudinaryResult;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error || error.message || 'Upload failed';
        setState({ uploading: false, progress: 0, error: errorMessage });
        onError?.(errorMessage);
        return null;
      }
    },
    [compress, maxWidth, maxHeight, targetSizeKB, getSignedParams, folder, onSuccess, onError, onProgress]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<(CloudinaryUploadResult | null)[]> => {
      const results: (CloudinaryUploadResult | null)[] = [];

      for (const file of files) {
        const result = await upload(file);
        results.push(result);
      }

      return results;
    },
    [upload]
  );

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null });
  }, []);

  return {
    upload,
    uploadMultiple,
    reset,
    uploading: state.uploading,
    progress: state.progress,
    error: state.error,
  };
}
