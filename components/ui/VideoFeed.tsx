'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';

interface Video {
  id: string;
  src: string;
  poster?: string;
  title?: string;
}

interface VideoFeedProps {
  initialVideos: Video[];
  onLoadMore: () => Promise<Video[]>;
}

export default function VideoFeed({ initialVideos, onLoadMore }: VideoFeedProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const videoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const preloadVideo = useCallback((src: string) => {
    if (preloadedVideos.has(src)) return;
    
    const video = document.createElement('video');
    video.src = src;
    video.preload = 'metadata';
    video.load();
    
    setPreloadedVideos(prev => new Set([...prev, src]));
  }, [preloadedVideos]);

  const loadMoreVideos = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newVideos = await onLoadMore();
      setVideos(prev => [...prev, ...newVideos]);
      
      newVideos.slice(0, 2).forEach(video => {
        preloadVideo(video.src);
      });
    } catch (error) {
      console.error('Failed to load more videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onLoadMore, preloadVideo]);

  const handleVideoEnd = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, videos.length]);

  const handleVideoLoadStart = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < videos.length) {
      preloadVideo(videos[nextIndex].src);
    }
    
    if (nextIndex + 1 < videos.length) {
      preloadVideo(videos[nextIndex + 1].src);
    }
  }, [currentIndex, videos, preloadVideo]);

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
            setCurrentIndex(videoIndex);
            
            if (videoIndex >= videos.length - 3) {
              loadMoreVideos();
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -20% 0px'
      }
    );

    videoRefs.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos, loadMoreVideos]);

  useEffect(() => {
    if (videos.length > 0) {
      preloadVideo(videos[0].src);
      if (videos.length > 1) {
        preloadVideo(videos[1].src);
      }
    }
  }, [videos, preloadVideo]);

  const setVideoRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      videoRefs.current.set(id, element);
    } else {
      videoRefs.current.delete(id);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          ref={(el) => setVideoRef(video.id, el)}
          data-video-id={video.id}
          className="w-full h-screen snap-start relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <VideoPlayer
            src={video.src}
            poster={video.poster}
            onEnded={handleVideoEnd}
            onLoadStart={handleVideoLoadStart}
            isActive={index === currentIndex}
          />
          
          {video.title && (
            <div className="absolute bottom-20 left-4 right-4 z-10">
              <h3 className="text-white text-lg font-semibold drop-shadow-lg">
                {video.title}
              </h3>
            </div>
          )}
        </motion.div>
      ))}
      
      {isLoading && (
        <div className="w-full h-screen flex items-center justify-center bg-black">
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