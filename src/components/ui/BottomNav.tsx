'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Bookmark, Plus, MessageSquare, User,
  Home as HomeFill, Bookmark as BookmarkFill, MessageSquare as MessageSquareFill, User as UserFill
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface BottomNavProps {
  onPostAdClick?: () => void;
}

const tabs = [
  {
    key: 'home',
    label: 'Home',
    href: '/',
    icon: Home,
    activeIcon: HomeFill,
    requiresAuth: false,
  },
  {
    key: 'saved',
    label: 'Saved',
    href: '/dashboard/favorites',
    icon: Bookmark,
    activeIcon: BookmarkFill,
    requiresAuth: true,
  },
  {
    key: 'sell',
    label: 'Sell',
    href: '/post-ad',
    icon: Plus,
    activeIcon: Plus,
    requiresAuth: false,
    isPrimary: true,
  },
  {
    key: 'chats',
    label: 'Message',
    href: '/dashboard/messages',
    icon: MessageSquare,
    activeIcon: MessageSquareFill,
    requiresAuth: true,
  },
  {
    key: 'account',
    label: 'Account',
    href: '/dashboard',
    icon: User,
    activeIcon: UserFill,
    requiresAuth: true,
  },
];

function useBottomNavVisibility() {
  const { direction, isAtTop } = useScrollDirection({ threshold: 8, throttleMs: 80 });
  const [visible, setVisible] = useState(true);
  const lastDirection = useRef<'up' | 'down' | null>(null);

  useEffect(() => {
    if (isAtTop) {
      setVisible(true);
      lastDirection.current = null;
      return;
    }
    if (direction === 'down' && lastDirection.current !== 'down') {
      setVisible(false);
    } else if (direction === 'up') {
      setVisible(true);
    }
    if (direction) lastDirection.current = direction;
  }, [direction, isAtTop]);

  return visible;
}

export default function BottomNav({ onPostAdClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();
  const visible = useBottomNavVisibility();

  useEffect(() => { setMounted(true); }, []);

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.key === 'home') return pathname === '/';
    if (tab.key === 'saved') return pathname === '/dashboard/favorites';
    if (tab.key === 'chats') return pathname.startsWith('/dashboard/messages');
    if (tab.key === 'account') return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
    return false;
  };

  const handleTabPress = (tab: typeof tabs[0], e: React.MouseEvent) => {
    e.preventDefault();
    if (tab.isPrimary) {
      if (onPostAdClick) onPostAdClick();
      else router.push(tab.href);
      return;
    }
    if (tab.requiresAuth && !isAuthenticated) {
      toggleLoginModal();
      return;
    }
    router.push(tab.href);
  };

  if (!mounted) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ease-out will-change-transform bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
      }}
    >
      <div>
        <div className="flex items-center justify-between h-12 max-w-lg mx-auto px-1 gap-1">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = active && tab.activeIcon ? tab.activeIcon : tab.icon;

            if (tab.isPrimary) {
              return (
                <button
                  key={tab.key}
                  onClick={(e) => handleTabPress(tab, e)}
                  className="relative flex flex-col items-center justify-center"
                  aria-label={tab.label}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded border border-gray-900 active:scale-90 transition-transform duration-150">
                    <Icon size={12} className="text-gray-900" strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-medium text-gray-900 mt-0.5">Sell</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.key}
                href={tab.href}
                onClick={(e) => handleTabPress(tab, e)}
                className="flex flex-col items-center justify-center py-1 min-w-[48px] active:scale-90 transition-transform duration-150"
              >
                <div className={`relative rounded-lg transition-colors duration-150 ${active ? 'text-gray-900' : 'text-gray-900'}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                </div>
                <span className={`text-[9px] font-medium mt-0.5 transition-colors duration-150 ${active ? 'text-gray-900' : 'text-gray-900'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
