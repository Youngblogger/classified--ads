'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Ban, FolderOpen, Copy, Ban as Prohibited, MessageSquare, FileText, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { getAuthToken } from '@/lib/cookies';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface ReportAdModalProps {
  adId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ReportReason {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const REPORT_REASONS: ReportReason[] = [
  { value: 'spam', label: 'Spam / Scam', icon: <Ban className="w-4 h-4" /> },
  { value: 'misleading', label: 'Misleading Information', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'wrong_category', label: 'Wrong Category', icon: <FolderOpen className="w-4 h-4" /> },
  { value: 'duplicate', label: 'Duplicate Ad', icon: <Copy className="w-4 h-4" /> },
  { value: 'prohibited', label: 'Prohibited Item', icon: <Prohibited className="w-4 h-4" /> },
  { value: 'offensive', label: 'Offensive Content', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <FileText className="w-4 h-4" /> },
];

export default function ReportAdModal({ adId, isOpen, onClose }: ReportAdModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason('');
      setMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to report an ad');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad_id: adId,
          reason: selectedReason,
          description: message.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      toast.success('Report submitted successfully. Thank you!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Report submission error:', error);
      toast.error(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-[99999] p-0 sm:p-4 pt-[10vh] sm:pt-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Report this Ad</h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="px-4 sm:px-5 py-3 overflow-y-auto flex-1 min-h-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Why are you reporting this ad?</p>
          
          <div className="space-y-1.5 sm:space-y-2">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason.value}
                onClick={() => setSelectedReason(reason.value)}
                className={`
                  w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left
                  ${selectedReason === reason.value 
                    ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]' 
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <span className={`flex-shrink-0 ${selectedReason === reason.value ? 'text-[#1E3A8A]' : 'text-gray-400'}`}>
                  {reason.icon}
                </span>
                <span className="text-xs sm:text-sm font-medium">{reason.label}</span>
                <span className="ml-auto flex-shrink-0">
                  {selectedReason === reason.value ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E3A8A]" />
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300" />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Optional Message */}
          <div className="mt-3 sm:mt-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add more details (optional)"
              rows={2}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent resize-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-200 flex gap-2 sm:gap-3 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-colors text-xs sm:text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className={`
              flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2
              ${!selectedReason || isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#1E3A8A] text-white hover:bg-[#1D4ED8]'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Submit</span>
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
