'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { useVideo } from '@/lib/videoContext';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onEnded: () => void;
  onLoadStart: () => void;
  isActive: boolean;
  videoId: string;
}

export default function VideoPlayer({ src, poster, onEnded, onLoadStart, isActive, videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gestureAnimation, setGestureAnimation] = useState<'left' | 'right' | null>(null);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isDoubleTapping, setIsDoubleTapping] = useState(false);
  
  const { 
    isMuted, 
    toggleMute, 
    currentVideoId,
    setCurrentVideoId,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
    setActiveVideoRef
  } = useVideo();

  const handleMuteToggle = useCallback(() => {
    toggleMute();
    setShowMuteIcon(true);
    setTimeout(() => setShowMuteIcon(false), 2000);
  }, [toggleMute]);

  const skipTime = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    
    setGestureAnimation(seconds > 0 ? 'right' : 'left');
    setTimeout(() => setGestureAnimation(null), 600);
  }, []);

  // Scrubbing handlers removed - now handled by global progress bar

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (currentVideoId === videoId) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (currentVideoId === videoId) {
        setDuration(video.duration);
      }
      video.muted = isMuted;
      if (isActive) {
        video.play().catch(() => {});
        if (currentVideoId === videoId) {
          setIsPlaying(true);
        }
      }
    };

    const handlePlay = () => {
      if (currentVideoId === videoId) {
        setIsPlaying(true);
      }
    };
    
    const handlePause = () => {
      if (currentVideoId === videoId) {
        setIsPlaying(false);
      }
    };
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
  }, [isActive, onEnded, onLoadStart, isMuted, currentVideoId, videoId, setCurrentTime, setDuration, setIsPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isPlaying) {
      video.play().catch(() => {});
    } else if (!isActive && isPlaying) {
      video.pause();
    }
  }, [isActive, isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
    }
  }, [isMuted]);

  // Update active video when this video becomes active
  useEffect(() => {
    if (isActive && videoRef.current) {
      setCurrentVideoId(videoId);
      setActiveVideoRef(videoRef);
    }
  }, [isActive, videoId, setCurrentVideoId, setActiveVideoRef]);

  // Reset local state when video changes  
  useEffect(() => {
    if (currentVideoId === videoId) {
      // This is the active video, don't reset
      return;
    }
  }, [videoId, src, currentVideoId]);

  const handleTap = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Check if tap is from progress bar area
    const target = event.target as HTMLElement;
    if (target.closest('.fixed.bottom-0')) {
      return; // Don't handle taps on progress bar
    }

    event.preventDefault();
    
    // Clear any existing timeout
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      setTapTimeout(null);
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Ignore taps in bottom 60px (progress bar area)
    if (y > rect.height - 60) {
      return;
    }

    const leftZone = rect.width * 0.3;
    const rightZone = rect.width * 0.7;

    // Set up double-tap detection
    setIsDoubleTapping(true);
    const timeout = setTimeout(() => {
      setIsDoubleTapping(false);
      // Only trigger mute if this was truly a single tap (not part of double-tap)
      if (!isDoubleTapping) {
        handleMuteToggle();
      }
    }, 300);
    setTapTimeout(timeout);

    // Handle double-tap immediately
    if (isDoubleTapping) {
      clearTimeout(timeout);
      setTapTimeout(null);
      setIsDoubleTapping(false);
      
      if (x < leftZone) {
        skipTime(-5);
      } else if (x > rightZone) {
        skipTime(5);
      }
    }
  }, [tapTimeout, isDoubleTapping, handleMuteToggle, skipTime]);

  // Removed useGesture in favor of native event handlers

  return (
    <div 
      ref={containerRef}
      onClick={handleTap}
      onTouchStart={handleTap}
      className="relative w-full h-full bg-black overflow-hidden"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
        muted={isMuted}
        loop={false}
      />

      {/* Gesture Animation */}
      <AnimatePresence>
        {gestureAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute top-1/2 transform -translate-y-1/2 ${
              gestureAnimation === 'left' ? 'left-8' : 'right-8'
            } bg-black/70 rounded-full p-4 z-20`}
          >
            {gestureAnimation === 'left' ? (
              <SkipBack className="w-8 h-8 text-white" />
            ) : (
              <SkipForward className="w-8 h-8 text-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute Icon */}
      <AnimatePresence>
        {showMuteIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 z-20"
          >
            <div className="bg-black/70 rounded-full p-2">
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white drop-shadow-lg" />
              ) : (
                <Volume2 className="w-6 h-6 text-white drop-shadow-lg" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar removed from individual videos - now global */}

      {/* Gesture Zones */}
      <div className="gesture-zone left" />
      <div className="gesture-zone right" />
    </div>
  );
}