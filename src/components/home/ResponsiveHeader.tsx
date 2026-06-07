'use client';

import MobileHeader from './MobileHeader';
import Header from './Header';

export default function ResponsiveHeader({ variant = 'homepage', onMenuToggle }: { variant?: 'homepage' | 'default'; onMenuToggle?: () => void }) {
  return (
    <div className="w-full">
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="hidden md:block">
        <Header variant={variant} onMenuToggle={onMenuToggle} />
      </div>
    </div>
  );
}
