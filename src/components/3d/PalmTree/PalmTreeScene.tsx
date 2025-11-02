'use client';

import React from 'react';
import { PalmTree } from './PalmTree';

interface PalmTreeSceneProps {
    enableControls?: boolean;
    autoRotate?: boolean;
    intensity?: number;
    scale?: number;
}

export default function PalmTreeScene({
  enableControls = false,
  autoRotate = true,
  intensity = 1,
  scale = 1,
}: PalmTreeSceneProps) {
  return (
    <PalmTree
      position={[0, -1, 0]} // Slight vertical offset for better centering
      scale={scale}
      autoRotate={autoRotate}
      enableControls={enableControls}
      intensity={intensity}
    />
  );
}
