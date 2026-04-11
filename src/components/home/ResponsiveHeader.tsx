'use client';

import MobileHeader from './MobileHeader';
import Header from './Header';

export default function ResponsiveHeader() {
  return (
    <>
      <div className="hidden md:block w-full sticky top-0 z-50">
        <Header />
      </div>
      <div className="md:hidden w-full sticky top-0 z-50">
        <MobileHeader />
      </div>
    </>
  );
}