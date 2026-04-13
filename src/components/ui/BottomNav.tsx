'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  MessageCircle, 
  Plus, 
  Bookmark, 
  User,
  Home as HomeOutline,
  MessageCircle as MessageCircleOutline,
  Bookmark as BookmarkOutline,
  User as UserOutline
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface BottomNavProps {
  onPostAdClick?: () => void;
}

export default function BottomNav({ onPostAdClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login');
    }
  };

  const handleChatsClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login');
    }
  };

  const handleSavedClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login');
    }
  };

  const navItems = [
    {
      icon: isActive('/') ? Home : HomeOutline,
      label: 'Home',
      path: '/',
    },
    {
      icon: isActive('/dashboard/messages') ? MessageCircle : MessageCircleOutline,
      label: 'Chats',
      path: '/dashboard/messages',
      requiresAuth: true,
    },
  ];

  const rightItems = [
    {
      icon: isActive('/dashboard/favorites') ? Bookmark : BookmarkOutline,
      label: 'Saved',
      path: '/dashboard/favorites',
      requiresAuth: true,
    },
    {
      icon: isActive('/dashboard') ? User : UserOutline,
      label: 'Profile',
      path: '/dashboard',
      requiresAuth: true,
    },
  ];

  const handlePostAd = () => {
    if (onPostAdClick) {
      onPostAdClick();
    } else {
      router.push('/post-ad');
    }
  };

  if (!mounted) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 pb-0 pt-1 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Left Items */}
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
            onClick={item.requiresAuth ? handleChatsClick : undefined}
            className="flex flex-col items-center justify-center p-2"
          >
            <item.icon 
              size={24} 
              className={isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}
              strokeWidth={isActive(item.path) ? 2.5 : 1.5}
            />
            <span 
              className={`text-[10px] font-medium mt-0.5 ${isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}`}
            >
              {item.label}
            </span>
          </Link>
        ))}

        {/* Center FAB */}
        <button 
          onClick={handlePostAd}
          className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-lg -mt-2"
          style={{ boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)' }}
          aria-label="Post Ad"
        >
          <Plus size={24} className="text-white" strokeWidth={3} />
        </button>

        {/* Right Items */}
        {rightItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            onClick={item.requiresAuth ? item.path === '/dashboard' ? handleProfileClick : item.path === '/dashboard/favorites' ? handleSavedClick : undefined : undefined}
            className="flex flex-col items-center justify-center p-2"
          >
            <item.icon 
              size={24} 
              className={isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}
              strokeWidth={isActive(item.path) ? 2.5 : 1.5}
            />
            <span 
              className={`text-[10px] font-medium mt-0.5 ${isActive(item.path) ? 'text-primary-600' : 'text-gray-500'}`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}