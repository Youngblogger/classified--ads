'use client';

import { UploadingImage } from '@/types';
import { GripVertical, X, RefreshCw, Check, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface ImageUploadCardProps {
  image: UploadingImage;
  index: number;
  isDragged: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export default function ImageUploadCard({
  image,
  index,
  isDragged,
  onDragStart,
  onDragEnd,
  onDragOver,
  onRemove,
  onRetry,
}: ImageUploadCardProps) {
  const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    pending: { icon: <Clock className="w-3 h-3" />, label: 'Pending', color: 'bg-gray-500' },
    queued: { icon: <Clock className="w-3 h-3" />, label: 'Queued', color: 'bg-blue-500' },
    uploading: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Uploading', color: 'bg-blue-500' },
    processing: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: 'Processing', color: 'bg-yellow-500' },
    completed: { icon: <Check className="w-3 h-3" />, label: 'Completed', color: 'bg-green-500' },
    failed: { icon: <AlertTriangle className="w-3 h-3" />, label: 'Failed', color: 'bg-red-500' },
  };

  const status = statusConfig[image.status] || statusConfig.pending;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
        isDragged ? 'border-primary-500 opacity-50 scale-95' : 'border-gray-200'
      } ${image.status === 'failed' ? 'border-red-400 ring-2 ring-red-100' : ''} ${
        image.status === 'completed' ? 'border-green-400' : ''
      }`}
    >
      <img
        src={image.preview}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3ENo Preview%3C/text%3E%3C/svg%3E';
        }}
      />

      {/* Overlay during upload */}
      {(image.status === 'uploading' || image.status === 'processing') && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-1" />
            <span className="text-white text-xs font-semibold">{image.progress}%</span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {image.status === 'uploading' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-primary-500 transition-all duration-200 ease-out"
            style={{ width: `${image.progress}%` }}
          />
        </div>
      )}

      {/* Drag handle */}
      <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Remove button - hidden during upload */}
      {image.status !== 'uploading' && (
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Status badge */}
      <div className="absolute bottom-1 right-1">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold text-white ${status.color} shadow-sm`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Cover badge */}
      {index === 0 && image.status === 'completed' && (
        <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">
          Cover
        </div>
      )}

      {/* Retry button on failure */}
      {image.status === 'failed' && (
        <button
          onClick={() => onRetry(image.id)}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10"
          title="Retry upload"
        >
          <div className="flex flex-col items-center gap-1">
            <RefreshCw className="w-6 h-6 text-white" />
            <span className="text-white text-xs font-semibold">Retry</span>
          </div>
        </button>
      )}
    </div>
  );
}
