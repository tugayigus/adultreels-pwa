'use client';

import { useState, useEffect } from 'react';
import AgeVerificationModal from '@/components/ui/AgeVerificationModal';
import TikTokVideoFeed from '@/components/ui/TikTokVideoFeed';
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt';
import { VideoProvider } from '@/lib/videoContext';
import { getInitialVideos, getMoreVideos, type Video } from '@/lib/mockApi';

export default function Home() {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [initialVideos, setInitialVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAgeVerification = () => {
      const verified = sessionStorage.getItem('age-verified') === 'true';
      setIsAgeVerified(verified);
    };

    const loadInitialVideos = async () => {
      try {
        const videos = await getInitialVideos();
        setInitialVideos(videos);
      } catch (error) {
        console.error('Failed to load initial videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAgeVerification();
    loadInitialVideos();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const handleAgeVerification = (verified: boolean) => {
    setIsAgeVerified(verified);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Loading AdultReels...</p>
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
        />
        <PWAInstallPrompt />
      </main>
    </VideoProvider>
  );
}
