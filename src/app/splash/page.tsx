'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChampionshipSplashScreen from '@/components/public/ChampionshipSplashScreen';
import { Play, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';

export default function DedicatedSplashPage() {
  const router = useRouter();
  const [key, setKey] = useState(0);

  const handleRestart = () => {
    setKey((prev) => prev + 1);
  };

  const handleComplete = () => {
    // When finished or skipped on /splash, route back to homepage
    router.push('/');
  };

  return (
    <div className="relative min-h-screen bg-[#05070B]">
      {/* Live Splash Screen */}
      <ChampionshipSplashScreen
        key={key}
        onComplete={handleComplete}
        autoDismissDelay={4500}
        forceShow={true}
      />
    </div>
  );
}

