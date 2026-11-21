'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import ChampionshipSplashScreen from '@/components/public/ChampionshipSplashScreen';

export default function PortalSplashScreen() {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  // Skip if directly on the dedicated /splash test page to avoid double overlays
  if (pathname === '/splash') return null;

  if (!showSplash) return null;

  return (
    <ChampionshipSplashScreen
      onComplete={() => setShowSplash(false)}
      autoDismissDelay={2100}
    />
  );
}

