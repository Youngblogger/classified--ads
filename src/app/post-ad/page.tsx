'use client';

import ResponsiveHeader from '@/components/home/ResponsiveHeader';
import Footer from '@/components/layout/Footer';
import PostAdForm from '@/components/forms/PostAdForm';
import { Check, Shield, Clock, Star } from 'lucide-react';

export default function PostAdPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="hidden md:block">
        <ResponsiveHeader variant="default" />
      </div>
      
      <main className="flex-1 pt-16 md:pt-24 pb-8">
        <div className="container-app">
          <PostAdForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}

