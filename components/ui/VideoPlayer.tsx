'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoProgressBar from './VideoProgressBar';
import { useVideo } from '@/lib/videoContext';

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [gestureAnimation, setGestureAnimation] = useState<'left' | 'right' | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const { isMuted, toggleMute } = useVideo();

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

  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleScrubStart = useCallback(() => {
    setIsScrubbing(true);
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, []);

  const handleScrubEnd = useCallback(() => {
    setIsScrubbing(false);
    if (videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      video.muted = isMuted;
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
  }, [isActive, onEnded, onLoadStart, isScrubbing, isMuted]);

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

  const bind = useGesture(
    {
      onClick: ({ event }) => {
        event.preventDefault();
        handleMuteToggle();
      },
      onDoubleClick: ({ event }) => {
        event.preventDefault();
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = (event as MouseEvent).clientX - rect.left;
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
            <div className="text-white text-2xl">
              {gestureAnimation === 'left' ? '⏪' : '⏩'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute Icon */}
      <AnimatePresence>
        {(showMuteIcon || isMuted) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 z-20"
          >
            <div className="bg-black/70 rounded-full p-2">
              <div className="text-white text-xl">
                {isMuted ? '🔇' : '🔊'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Progress Bar */}
      <VideoProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        onScrubStart={handleScrubStart}
        onScrubEnd={handleScrubEnd}
      />

      {/* Gesture Zones */}
      <div className="gesture-zone left" />
      <div className="gesture-zone right" />
    </div>
  );
}