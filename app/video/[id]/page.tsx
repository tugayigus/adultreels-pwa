'use client';

import { useEffect } from 'react';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VideoPage({ params }: VideoPageProps) {
  useEffect(() => {
    params.then(({ id }) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('startVideoId', id);
        window.location.href = '/';
      }
    });
  }, [params]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-sm">Loading video...</p>
      </div>
    </div>
  );
}