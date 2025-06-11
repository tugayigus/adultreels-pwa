'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onEnded: () => void;
  onLoadStart: () => void;
  isActive: boolean;
}

export default function VideoPlayer({ src, poster, onEnded, onLoadStart, isActive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [gestureAnimation, setGestureAnimation] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const skipTime = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    
    setGestureAnimation(seconds > 0 ? 'right' : 'left');
    setTimeout(() => setGestureAnimation(null), 600);
  }, []);

  const handleScrubbing = useCallback((value: number) => {
    if (!videoRef.current) return;
    
    const newTime = (value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(value);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent || 0);
      }
    };

    const handleLoadedMetadata = () => {
      if (isActive) {
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', onLoadStart);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', onLoadStart);
    };
  }, [isActive, onEnded, onLoadStart, isDragging]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isPlaying) {
      video.play().catch(() => {});
    } else if (!isActive && isPlaying) {
      video.pause();
    }
  }, [isActive, isPlaying]);

  const bind = useGesture(
    {
      onClick: ({ event }) => {
        event.preventDefault();
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = (event as any).clientX - rect.left;
        const centerX = rect.width / 2;
        
        if (Math.abs(x - centerX) < rect.width * 0.2) {
          togglePlay();
        }
      },
      onDoubleClick: ({ event }) => {
        event.preventDefault();
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = (event as any).clientX - rect.left;
        const leftZone = rect.width * 0.3;
        const rightZone = rect.width * 0.7;
        
        if (x < leftZone) {
          skipTime(-5);
        } else if (x > rightZone) {
          skipTime(5);
        }
      },
    }
  );

  return (
    <div 
      ref={containerRef}
      {...bind()}
      className="relative w-full h-full bg-black overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
      onTouchEnd={() => setTimeout(() => setShowControls(false), 3000)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
        muted
        loop={false}
      />

      <AnimatePresence>
        {gestureAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute top-1/2 transform -translate-y-1/2 ${
              gestureAnimation === 'left' ? 'left-8' : 'right-8'
            } bg-black/70 rounded-full p-4`}
          >
            <div className="text-white text-2xl">
              {gestureAnimation === 'left' ? '⏪' : '⏩'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="text-white text-2xl hover:scale-110 transition-transform"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => {
                    setIsDragging(true);
                    handleScrubbing(parseFloat(e.target.value));
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="scrubber-track w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="gesture-zone left" />
      <div className="gesture-zone right" />
    </div>
  );
}