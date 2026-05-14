'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Search, Plus, MessageSquare, User,
  Home as HomeFill, MessageSquare as MessageSquareFill, User as UserFill
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';

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
    key: 'search',
    label: 'Search',
    href: '/ads',
    icon: Search,
    activeIcon: Search,
    requiresAuth: false,
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
    label: 'Chats',
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

export default function BottomNav({ onPostAdClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { toggleLoginModal } = useUIStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.key === 'home') return pathname === '/';
    if (tab.key === 'search') return pathname === '/ads' || pathname.startsWith('/ad/');
    if (tab.key === 'chats') return pathname.startsWith('/dashboard/messages');
    if (tab.key === 'account') return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
    return false;
  };

  const handleTabPress = (tab: typeof tabs[0], e: React.MouseEvent) => {
    if (tab.isPrimary) {
      e.preventDefault();
      if (onPostAdClick) {
        onPostAdClick();
      } else {
        router.push(tab.href);
      }
      return;
    }

    if (tab.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      toggleLoginModal();
    }
  };

  if (!mounted) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = active && tab.activeIcon ? tab.activeIcon : tab.icon;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.key}
                onClick={(e) => handleTabPress(tab, e)}
                className="relative flex flex-col items-center justify-center -mt-3"
                aria-label={tab.label}
              >
                <div className="w-11 h-11 rounded-full bg-primary-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150" style={{ boxShadow: '0 2px 12px rgba(37, 99, 235, 0.35)' }}>
                  <Icon size={22} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-semibold text-primary-600 mt-1">Sell</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.key}
              href={tab.href}
              onClick={(e) => handleTabPress(tab, e)}
              className="flex flex-col items-center justify-center px-2 py-1 min-w-[56px] active:scale-95 transition-transform duration-150"
            >
              <div className={`relative p-1 rounded-lg transition-colors duration-150 ${active ? 'text-primary-600' : 'text-gray-400'}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600" />
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 transition-colors duration-150 ${active ? 'text-primary-600' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
