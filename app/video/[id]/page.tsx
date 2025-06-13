'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

interface VideoPageProps {
  params: {
    id: string;
  };
}

export default function VideoPage({ params }: VideoPageProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('startVideoId', params.id);
      window.location.href = '/';
    }
  }, [params.id]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-sm">Loading video...</p>
      </div>
    </div>
  );
}