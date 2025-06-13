'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX, Volume2, SkipBack, SkipForward, Share2, Play, Pause } from 'lucide-react';
import { useVideo } from '@/lib/videoContext';

interface TikTokVideoPlayerProps {
  src: string;
  poster?: string;
  onEnded: () => void;
  isActive: boolean;
  index: number;
  videoPermanentId: string;
}

export default function TikTokVideoPlayer({ 
  src, 
  poster, 
  onEnded, 
  isActive, 
  index,
  videoPermanentId 
}: TikTokVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Local state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
  const [gestureAnimation, setGestureAnimation] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  // Global state
  const { isMuted, toggleMute, setCurrentVideoIndex } = useVideo();

  // Progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Share handler
  const handleShare = useCallback(async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/p/${videoPermanentId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this video',
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  }, [videoPermanentId]);

  // Play/Pause toggle handler
  const handlePlayPauseToggle = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    
    setShowPlayPauseIcon(true);
    setTimeout(() => setShowPlayPauseIcon(false), 1000);
  }, [isPlaying]);

  // Mute toggle handler (for dedicated button)
  const handleMuteToggle = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    toggleMute();
  }, [toggleMute]);

  // Skip time handler
  const skipTime = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    setGestureAnimation(seconds > 0 ? 'right' : 'left');
    setTimeout(() => setGestureAnimation(null), 600);
  }, [duration]);

  // Progress bar seeking
  const handleProgressSeek = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!progressRef.current || !videoRef.current || duration <= 0) return;
    
    e.stopPropagation();
    
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newTime = (percentage / 100) * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // Drag handlers for progress bar
  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleProgressSeek(e);
  }, [handleProgressSeek]);

  const handleProgressTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    handleProgressSeek(e);
  }, [handleProgressSeek]);

  // Global mouse/touch handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && progressRef.current && videoRef.current && duration > 0) {
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newTime = (percentage / 100) * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && progressRef.current && videoRef.current && duration > 0) {
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const newTime = (percentage / 100) * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    };

    const handleGlobalEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, duration]);

  // Video tap handler
  const handleVideoTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't handle taps on progress bar
    if ((e.target as HTMLElement).closest('.progress-bar')) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const leftZone = rect.width * 0.3;
    const rightZone = rect.width * 0.7;

    setTapCount(prev => prev + 1);

    if (tapTimer) {
      clearTimeout(tapTimer);
    }

    const timer = setTimeout(() => {
      if (tapCount === 1) {
        // Single tap - play/pause toggle
        handlePlayPauseToggle();
      } else if (tapCount === 2) {
        // Double tap - skip
        if (x < leftZone) {
          skipTime(-5);
        } else if (x > rightZone) {
          skipTime(5);
        }
      }
      setTapCount(0);
    }, 300);

    setTapTimer(timer);
  }, [tapCount, tapTimer, handlePlayPauseToggle, skipTime]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      video.muted = isMuted;
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
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

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isDragging, isMuted, onEnded]);

  // Handle active video changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      setCurrentVideoIndex(index);
      video.muted = isMuted;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      video.currentTime = 0;
    }
  }, [isActive, index, setCurrentVideoIndex, isMuted]);

  // Handle mute changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      onClick={handleVideoTap}
      onTouchStart={handleVideoTap}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        preload="metadata"
        loop={false}
      />

      {/* Action Icons - Share and Mute positioned directly above progress bar with minimal spacing */}
      {isActive && (
        <div className="absolute z-30" style={{ 
          right: '16px',
          bottom: 'calc(35px + env(safe-area-inset-bottom) + var(--browser-ui-height, 0px))'
        }}>
          {/* Share Button */}
          <button
            onClick={handleShare}
            onTouchStart={handleShare}
            className="block mb-6 bg-black/70 hover:bg-black/80 rounded-full p-4 transition-all duration-200"
            aria-label="Share video"
          >
            <Share2 className="w-8 h-8 text-white" />
          </button>
          
          {/* Mute Button */}
          <button
            onClick={handleMuteToggle}
            onTouchStart={handleMuteToggle}
            className="block bg-black/70 hover:bg-black/80 rounded-full p-4 transition-all duration-200"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <VolumeX className="w-8 h-8 text-white" />
            ) : (
              <Volume2 className="w-8 h-8 text-white" />
            )}
          </button>
        </div>
      )}

      {/* Progress Bar - Only show for active video, positioned at very bottom */}
      {isActive && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-50" style={{
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          <div
            ref={progressRef}
            className="relative w-full h-8 flex items-center cursor-pointer px-4"
            onMouseDown={handleProgressMouseDown}
            onTouchStart={handleProgressTouchStart}
            style={{ touchAction: 'none' }}
          >
            {/* Progress track */}
            <div className="relative w-full h-2">
              <div className="absolute inset-0 bg-white/30 rounded-full" />
              
              {/* Progress fill */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full origin-left transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              
              {/* Drag handle */}
              {isDragging && (
                <div 
                  className="absolute top-1/2 w-4 h-4 bg-white rounded-full transform -translate-y-1/2 shadow-lg border-2 border-pink-500"
                  style={{ left: `${progress}%`, marginLeft: '-8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Play/Pause Icon */}
      <AnimatePresence>
        {showPlayPauseIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="bg-black/70 rounded-full p-4">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white drop-shadow-lg" />
              ) : (
                <Play className="w-8 h-8 text-white drop-shadow-lg" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 px-6 py-3 rounded-lg z-50"
          >
            <p className="text-white text-sm font-medium">Link copied to clipboard!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture Zones for Visual Feedback */}
      <div className="absolute top-0 left-0 w-1/3 h-full z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full z-10 pointer-events-none" />
    </div>
  );
}