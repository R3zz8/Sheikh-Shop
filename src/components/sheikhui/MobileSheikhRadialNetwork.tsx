'use client';

import React from 'react';
import Link from 'next/link';
import { SHEIKH_RADIAL_CATEGORIES } from './radialCategoryData';

export default function MobileSheikhRadialNetwork() {
  // Center coordinates in percentage for responsiveness
  const center = { x: 50, y: 44 };

  // Elliptical radii for surrounding category nodes
  const radiusX = 36; // % of container width
  const radiusY = 32; // % of container height

  // Calculate node positions
  const nodes = SHEIKH_RADIAL_CATEGORIES.map((cat) => {
    const rad = (cat.angleDeg * Math.PI) / 180;
    // angleDeg 0 is top (12:00), clockwise
    const x = center.x + radiusX * Math.sin(rad);
    const y = center.y - radiusY * Math.cos(rad);

    // Midpoint for line particle / beam highlight
    const midX = center.x + (radiusX * 0.52) * Math.sin(rad);
    const midY = center.y - (radiusY * 0.52) * Math.cos(rad);

    return {
      ...cat,
      x,
      y,
      midX,
      midY,
    };
  });

  return (
    <section
      aria-label="دسته‌بندی‌های اکوسیستم شیخ"
      className="relative w-full overflow-hidden px-3 py-3 select-none"
    >
      {/* Premium Outer Glassmorphic Panel */}
      <div className="relative w-full max-w-[430px] mx-auto rounded-3xl bg-stone-950/55 border border-amber-500/20 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md p-3 overflow-hidden">

        {/* Subtle Inner Highlight Border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent pointer-events-none" />

        {/* Soft Background Warm Glass Tint & Ambient Radial Glow behind "شیخ" */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-stone-950/20 to-amber-950/20 pointer-events-none" />
        <div className="absolute top-[44%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Inner Content Box with Exact Compact Height */}
        <div className="relative w-full h-[300px] xs:h-[310px] flex flex-col justify-between">

          {/* SVG Connection Network Layer (Laser Beams) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Laser Beam Gradient */}
              <linearGradient id="sheikhLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
              </linearGradient>

              {/* Laser Beam Outer Glow Gradient */}
              <linearGradient id="sheikhLaserGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Orbit Ring behind center */}
            <circle
              cx={`${center.x}%`}
              cy={`${center.y}%`}
              r="12.5%"
              fill="none"
              stroke="#fbbf24"
              strokeOpacity="0.2"
              strokeWidth="0.35"
              strokeDasharray="1.2 1.8"
            />

            {/* Laser Connections from Center to Each Node */}
            {nodes.map((node) => (
              <g key={`laser-${node.id}`}>
                {/* Outer Ambient Laser Beam Glow */}
                <line
                  x1={`${center.x}%`}
                  y1={`${center.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="url(#sheikhLaserGlow)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Core Fine Warm Light Beam */}
                <line
                  x1={`${center.x}%`}
                  y1={`${center.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="url(#sheikhLaserGrad)"
                  strokeWidth="0.4"
                  strokeLinecap="round"
                />
                {/* Subdued Midpoint Light Beam Particle */}
                <circle
                  cx={`${node.midX}%`}
                  cy={`${node.midY}%`}
                  r="0.6"
                  fill="#fef08a"
                  fillOpacity="0.9"
                  className="motion-safe:animate-pulse"
                />
              </g>
            ))}
          </svg>

          {/* CENTER NODE: "شیخ" BRAND EMBLEM */}
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full pointer-events-none"
            style={{
              left: `${center.x}%`,
              top: `${center.y}%`,
              width: '66px',
              height: '66px',
            }}
          >
            {/* Ambient Outer Halo */}
            <div className="absolute -inset-2.5 rounded-full bg-gradient-radial from-amber-400/20 via-amber-500/5 to-transparent blur-md motion-safe:animate-pulse" />

            {/* Outer Subtle Glass Ring */}
            <div className="absolute inset-0 rounded-full border border-amber-300/40 shadow-[0_0_16px_rgba(245,158,11,0.25)] bg-amber-950/40 backdrop-blur-sm" />

            {/* Inner Disc */}
            <div className="relative w-[56px] h-[56px] rounded-full bg-gradient-to-br from-amber-950/90 via-stone-950 to-amber-900/80 border border-amber-400/60 shadow-inner flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-vazirmatn tracking-tight select-none">
                شیخ
              </span>
            </div>
          </div>

          {/* 8 SURROUNDING CATEGORY NODES */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {nodes.map((node) => {
              const IconComponent = node.icon;
              return (
                <Link
                  key={node.id}
                  href={node.href}
                  aria-label={node.name}
                  className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center justify-center transition-transform duration-200 active:scale-95 focus:outline-none"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                  }}
                >
                  {/* Glassmorphic Category Button */}
                  <div
                    className="relative flex flex-col items-center justify-center rounded-2xl bg-stone-950/70 border border-amber-500/30 group-hover:border-amber-300/60 group-hover:bg-stone-900/80 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-200 backdrop-blur-sm px-0.5 py-1"
                    style={{
                      width: '52px',
                      height: '52px',
                    }}
                  >
                    {/* Subtle Inner Highlight */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-400/10 to-transparent pointer-events-none" />

                    {/* Category Icon */}
                    <IconComponent
                      className="w-4 h-4 mb-0.5 text-amber-300 group-hover:text-amber-100 transition-colors shrink-0"
                      aria-hidden="true"
                    />

                    {/* Category Label - Uses shortName for full, non-truncated Persian labels */}
                    <span className="text-[8.5px] font-bold text-amber-100/90 group-hover:text-white transition-colors font-vazirmatn text-center leading-tight max-w-[48px] truncate px-0.5">
                      {node.shortName}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* BOTTOM CALL TO ACTION BADGE */}
          <div className="mt-auto mb-0.5 text-center relative z-20">
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-950/60 border border-amber-500/20 shadow-md backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 motion-safe:animate-ping" />
              <span className="text-[10.5px] font-medium text-amber-200/90 font-vazirmatn">
                برای ورود به دسته‌بندی مورد نظر لمس کنید
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
