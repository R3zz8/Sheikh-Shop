'use client';

import React from 'react';
import { PalmTree } from './PalmTree';

interface PalmTreeSceneProps {
    enableControls?: boolean;
    autoRotate?: boolean;
    intensity?: number;
}

export default function PalmTreeScene({
  enableControls = false,
  autoRotate = true,
  intensity = 1,
}: PalmTreeSceneProps) {
  return (
    <PalmTree
      position={[0, 0, 0]}
      scale={1}
      autoRotate={autoRotate}
      enableControls={enableControls}
      intensity={intensity}
    />
  );
}
