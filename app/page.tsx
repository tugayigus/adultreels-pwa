'use client';

import { useState, useEffect } from 'react';
import AgeVerificationModal from '@/components/ui/AgeVerificationModal';
import TikTokVideoFeed from '@/components/ui/TikTokVideoFeed';
import PWAInstallPrompt from '@/components/ui/PWAInstallPrompt';
import { VideoProvider } from '@/lib/videoContext';
import { getInitialVideos, getMoreVideos, getAllVideos, type Video } from '@/lib/mockApi';

export default function Home() {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [initialVideos, setInitialVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startVideoPermanentId, setStartVideoPermanentId] = useState<string | null>(null);

  useEffect(() => {
    const checkAgeVerification = () => {
      const verified = sessionStorage.getItem('age-verified') === 'true';
      setIsAgeVerified(verified);
    };

    const loadInitialVideos = async () => {
      try {
        // Check if we need to start at a specific video via deep link
        const storedPermanentId = sessionStorage.getItem('startVideoPermanentId');
        
        if (storedPermanentId) {
          // Load all videos to enable full feed navigation
          const allVideos = await getAllVideos();
          setInitialVideos(allVideos);
          setStartVideoPermanentId(storedPermanentId);
          sessionStorage.removeItem('startVideoPermanentId');
        } else {
          // Normal homepage load - use paginated approach
          const videos = await getInitialVideos();
          setInitialVideos(videos);
        }
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
      <div className="h-viewport bg-black flex items-center justify-center">
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
          startVideoPermanentId={startVideoPermanentId}
        />
        <PWAInstallPrompt />
      </main>
    </VideoProvider>
  );
}
