'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VideoContextType {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  currentVideoId: string | null;
  setCurrentVideoId: (id: string) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  activeVideoRef: React.RefObject<HTMLVideoElement | null> | null;
  setActiveVideoRef: (ref: React.RefObject<HTMLVideoElement | null>) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeVideoRef, setActiveVideoRef] = useState<React.RefObject<HTMLVideoElement | null> | null>(null);

  useEffect(() => {
    const savedMuteState = localStorage.getItem('video-muted');
    if (savedMuteState) {
      setIsMuted(savedMuteState === 'true');
    }
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('video-muted', newMutedState.toString());
    
    // Apply to active video immediately
    if (activeVideoRef?.current) {
      activeVideoRef.current.muted = newMutedState;
    }
  };

  const setMuted = (muted: boolean) => {
    setIsMuted(muted);
    localStorage.setItem('video-muted', muted.toString());
    
    // Apply to active video immediately
    if (activeVideoRef?.current) {
      activeVideoRef.current.muted = muted;
    }
  };

  // Reset video state when video changes
  useEffect(() => {
    if (currentVideoId) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  }, [currentVideoId]);

  return (
    <VideoContext.Provider value={{ 
      isMuted, 
      toggleMute, 
      setMuted,
      currentVideoId,
      setCurrentVideoId,
      currentTime,
      setCurrentTime,
      duration,
      setDuration,
      isPlaying,
      setIsPlaying,
      activeVideoRef,
      setActiveVideoRef
    }}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}