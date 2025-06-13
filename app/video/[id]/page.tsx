'use client';

import { useEffect } from 'react';
import { migrateLegacyId } from '@/lib/videoId';

interface LegacyVideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LegacyVideoPage({ params }: LegacyVideoPageProps) {
  useEffect(() => {
    params.then(({ id }) => {
      if (typeof window !== 'undefined') {
        // Convert legacy numeric ID to permanent ID and redirect
        const permanentId = migrateLegacyId(id);
        window.location.href = `/p/${permanentId}`;
      }
    });
  }, [params]);

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-sm">Redirecting...</p>
      </div>
    </div>
  );
}