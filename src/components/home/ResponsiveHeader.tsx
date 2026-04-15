'use client';

import MobileHeader from './MobileHeader';
import Header from './Header';

export default function ResponsiveHeader() {
  return (
    <>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <div className="hidden md:block">
        <Header />
      </div>
    </>
  );
}
