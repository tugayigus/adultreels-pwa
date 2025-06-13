'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import TikTokVideoPlayer from './TikTokVideoPlayer';
import { useVideo } from '@/lib/videoContext';
import { Video } from '@/lib/mockApi';

interface TikTokVideoFeedProps {
  initialVideos: Video[];
  onLoadMore: () => Promise<Video[]>;
  startVideoPermanentId?: string | null;
}

export default function TikTokVideoFeed({ initialVideos, onLoadMore, startVideoPermanentId }: TikTokVideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [isLoading, setIsLoading] = useState(false);
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const videoRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastUrlUpdatedIndex = useRef<number>(-1);

  const { currentVideoIndex, setCurrentVideoIndex } = useVideo();
  const router = useRouter();

  // Preload video
  const preloadVideo = useCallback((src: string) => {
    if (preloadedVideos.has(src)) return;
    
    const video = document.createElement('video');
    video.src = src;
    video.preload = 'metadata';
    video.load();
    
    setPreloadedVideos(prev => new Set([...prev, src]));
  }, [preloadedVideos]);

  // Load more videos
  const loadMoreVideos = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newVideos = await onLoadMore();
      setVideos(prev => [...prev, ...newVideos]);
      
      // Preload first 2 new videos
      newVideos.slice(0, 2).forEach(video => {
        preloadVideo(video.src);
      });
    } catch (error) {
      console.error('Failed to load more videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onLoadMore, preloadVideo]);

  // Handle video end
  const handleVideoEnd = useCallback((index: number) => {
    if (index < videos.length - 1) {
      const nextIndex = index + 1;
      setCurrentVideoIndex(nextIndex);
      
      // Scroll to next video
      const nextVideoElement = videoRefs.current.get(videos[nextIndex].id);
      if (nextVideoElement) {
        nextVideoElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [videos, setCurrentVideoIndex]);

  // Set video ref
  const setVideoRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      videoRefs.current.set(id, element);
    } else {
      videoRefs.current.delete(id);
    }
  }, []);

  // Setup intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-video-id');
          if (!videoId) return;

          const videoIndex = videos.findIndex(v => v.id === videoId);
          
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setCurrentVideoIndex(videoIndex);
            
            // Only update URL if this is not the initial load and we've actually moved to a different video
            if (!isInitialLoad && lastUrlUpdatedIndex.current !== videoIndex) {
              const currentVideo = videos[videoIndex];
              if (currentVideo) {
                router.replace(`/p/${currentVideo.permanentId}`, { scroll: false });
                lastUrlUpdatedIndex.current = videoIndex;
              }
            }
            
            // Load more videos when near the end
            if (videoIndex >= videos.length - 3) {
              loadMoreVideos();
            }

            // Preload next videos
            const nextIndex = videoIndex + 1;
            if (nextIndex < videos.length) {
              preloadVideo(videos[nextIndex].src);
            }
            if (nextIndex + 1 < videos.length) {
              preloadVideo(videos[nextIndex + 1].src);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    // Observe all video elements - wait for them to be in DOM
    const observeVideos = () => {
      videoRefs.current.forEach((element) => {
        if (observerRef.current) {
          observerRef.current.observe(element);
        }
      });
    };

    // If we have video refs, observe immediately, otherwise wait a bit
    if (videoRefs.current.size > 0) {
      observeVideos();
    } else {
      const timer = setTimeout(observeVideos, 100);
      return () => {
        clearTimeout(timer);
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos, setCurrentVideoIndex, loadMoreVideos, preloadVideo, isInitialLoad, router]);

  // Preload initial videos
  useEffect(() => {
    if (videos.length > 0) {
      preloadVideo(videos[0].src);
      if (videos.length > 1) {
        preloadVideo(videos[1].src);
      }
    }
  }, [videos, preloadVideo]);

  // Handle deep link to specific video
  useEffect(() => {
    if (startVideoPermanentId && videos.length > 0) {
      const targetIndex = videos.findIndex(v => v.permanentId === startVideoPermanentId);
      if (targetIndex !== -1) {
        setCurrentVideoIndex(targetIndex);
        lastUrlUpdatedIndex.current = targetIndex; // Set this to prevent URL update
        
        // Wait for video refs to be set before scrolling
        const waitForRef = () => {
          const targetElement = videoRefs.current.get(videos[targetIndex].id);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'instant' });
            // Mark initial load as complete after scrolling and observer setup
            setTimeout(() => {
              setIsInitialLoad(false);
              // Trigger intersection observer manually for initial video
              if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current.observe(targetElement);
              }
            }, 300);
          } else {
            // If ref not ready, try again
            setTimeout(waitForRef, 50);
          }
        };
        
        setTimeout(waitForRef, 100);
      } else {
        // If no specific video found, start from beginning
        setCurrentVideoIndex(0);
        setTimeout(() => setIsInitialLoad(false), 500);
      }
    } else {
      // If no startVideoPermanentId, start from beginning
      setCurrentVideoIndex(0);
      setTimeout(() => setIsInitialLoad(false), 500);
    }
  }, [startVideoPermanentId, videos, setCurrentVideoIndex]);

  return (
    <div 
      ref={containerRef}
      className="h-viewport overflow-y-auto snap-y snap-mandatory"
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitScrollSnapType: 'y mandatory'
      }}
    >
      {/* Hide scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          ref={(el) => setVideoRef(video.id, el)}
          data-video-id={video.id}
          className="w-full h-viewport snap-start snap-always relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <TikTokVideoPlayer
            src={video.src}
            poster={video.poster}
            onEnded={() => handleVideoEnd(index)}
            isActive={index === currentVideoIndex}
            index={index}
            videoPermanentId={video.permanentId}
          />
          
          {/* Video Title - Constrained to left 50% of screen, positioned with mute icon level */}
          {video.title && (
            <div className="absolute left-4 z-10 pointer-events-none" style={{ 
              bottom: 'calc(50px + env(safe-area-inset-bottom) + var(--browser-ui-height, 0px))', // Same level as mute icon
              width: 'calc(50% - 16px)', // 50% width minus left padding
              maxWidth: 'calc(50vw - 16px)' // Ensure it never exceeds 50% of viewport width
            }}>
              <h3 className="text-white text-lg font-semibold drop-shadow-lg line-clamp-2">
                {video.title}
              </h3>
            </div>
          )}
        </motion.div>
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="w-full h-viewport flex items-center justify-center bg-black snap-start">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
          />
        </div>
      )}
    </div>
  );
}