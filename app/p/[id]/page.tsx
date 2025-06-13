'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isValidVideoId } from '@/lib/videoId';
import AgeVerificationModal from '@/components/ui/AgeVerificationModal';
import TikTokVideoFeed from '@/components/ui/TikTokVideoFeed';
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt';
import { VideoProvider } from '@/lib/videoContext';
import { getAllVideos, getMoreVideos, type Video } from '@/lib/mockApi';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VideoPage({ params }: VideoPageProps) {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [initialVideos, setInitialVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startVideoPermanentId, setStartVideoPermanentId] = useState<string | null>(null);
  const [isValidId, setIsValidId] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      const { id } = await params;
      
      // Validate the video ID format
      if (!isValidVideoId(id)) {
        setIsValidId(false);
        setIsLoading(false);
        return;
      }

      // Check age verification
      const verified = localStorage.getItem('age-verified') === 'true';
      setIsAgeVerified(verified);

      try {
        // Load all videos to enable full feed navigation
        const allVideos = await getAllVideos();
        setInitialVideos(allVideos);
        setStartVideoPermanentId(id);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, [params]);

  const handleAgeVerification = (verified: boolean) => {
    setIsAgeVerified(verified);
  };

  if (!isValidId) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Invalid video ID</p>
          <Link href="/" className="text-blue-400 underline">Go to homepage</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!isAgeVerified) {
    return (
      <AgeVerificationModal
        isOpen={true}
        onVerify={handleAgeVerification}
      />
    );
  }

  return (
    <VideoProvider>
      <main className="relative">
        <TikTokVideoFeed 
          initialVideos={initialVideos} 
          onLoadMore={getMoreVideos}
          startVideoPermanentId={startVideoPermanentId}
        />
        <PWAInstallPrompt />
      </main>
    </VideoProvider>
  );
}