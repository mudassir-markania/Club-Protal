'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ChampionshipSplashScreen from '@/components/public/ChampionshipSplashScreen';

export default function DedicatedSplashPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen bg-[#000511]">
      <ChampionshipSplashScreen
        onComplete={handleComplete}
        autoDismissDelay={3200}
      />
    </div>
  );
}
