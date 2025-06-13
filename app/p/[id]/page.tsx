'use client';

import { useEffect } from 'react';
import { isValidVideoId } from '@/lib/videoId';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VideoPage({ params }: VideoPageProps) {
  useEffect(() => {
    params.then(({ id }) => {
      if (typeof window !== 'undefined') {
        // Validate the video ID format
        if (!isValidVideoId(id)) {
          // Invalid ID format, redirect to home
          window.location.href = '/';
          return;
        }
        
        // Store the permanent ID to start from this video in the feed
        sessionStorage.setItem('startVideoPermanentId', id);
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