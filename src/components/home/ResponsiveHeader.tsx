'use client';

import MobileHeader from './MobileHeader';
import Header from './Header';

export default function ResponsiveHeader() {
  return (
    <>
      <div className="hidden md:block">
        <div className="sticky top-0 z-50">
          <Header />
        </div>
      </div>
      <div className="md:hidden">
        <div className="sticky top-0 z-50">
          <MobileHeader />
        </div>
      </div>
    </>
  );
}