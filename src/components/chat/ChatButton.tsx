'use client';

import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface ChatButtonProps {
  onClick: () => void;
  className?: string;
}

export default function ChatButton({ onClick, className = '' }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      Chat Seller
    </button>
  );
}
