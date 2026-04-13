'use client';

import MobileHeader from './MobileHeader';
import Header from './Header';

export default function ResponsiveHeader() {
  return (
    <header 
      style={{ 
        width: '100%',
      }}
    >
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="md:hidden">
        <MobileHeader />
      </div>
    </header>
  );
}
