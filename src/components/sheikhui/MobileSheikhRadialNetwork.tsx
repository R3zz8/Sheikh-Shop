'use client';

import React from 'react';
import Link from 'next/link';
import { SHEIKH_RADIAL_CATEGORIES } from './radialCategoryData';

export default function MobileSheikhRadialNetwork() {
  // Center coordinates in percentage for responsiveness
  const center = { x: 50, y: 45 };

  // Elliptical radii for surrounding category nodes
  const radiusX = 35; // % of container width
  const radiusY = 33; // % of container height

  // Calculate node positions
  const nodes = SHEIKH_RADIAL_CATEGORIES.map((cat) => {
    const rad = (cat.angleDeg * Math.PI) / 180;
    // angleDeg 0 is top (12:00), clockwise
    const x = center.x + radiusX * Math.sin(rad);
    const y = center.y - radiusY * Math.cos(rad);

    // Midpoint for connection line glowing particle
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
      className="relative w-full overflow-hidden bg-gradient-to-b from-stone-950 via-amber-950/30 to-stone-950 py-4 px-2 select-none"
      style={{ minHeight: '310px', maxHeight: '340px' }}
    >
      {/* Background Soft Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.18)_0%,transparent_70%)]"
      />

      {/* Main Container maintaining exact compact height */}
      <div className="relative w-full max-w-[430px] mx-auto h-[300px] xs:h-[310px] flex flex-col justify-between">

        {/* SVG Connection Network Layer (Behind Nodes) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Radial Line Gradient */}
            <linearGradient id="sheikhLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
            </linearGradient>

            {/* Glowing Dot Filter (Low GPU Cost) */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#f59e0b" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Connection Lines from Center to each Node */}
          {nodes.map((node) => (
            <g key={`line-${node.id}`}>
              {/* Outer soft glow line */}
              <line
                x1={`${center.x}%`}
                y1={`${center.y}%`}
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke="#f59e0b"
                strokeOpacity="0.3"
                strokeWidth="0.8"
              />
              {/* Core golden line */}
              <line
                x1={`${center.x}%`}
                y1={`${center.y}%`}
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke="url(#sheikhLineGrad)"
                strokeWidth="0.45"
              />
              {/* Midpoint Glowing Node Particle */}
              <circle
                cx={`${node.midX}%`}
                cy={`${node.midY}%`}
                r="0.75"
                fill="#fef08a"
                filter="url(#goldGlow)"
                className="motion-safe:animate-pulse"
              />
            </g>
          ))}

          {/* Concentric Golden Orbit Ring behind center */}
          <circle
            cx={`${center.x}%`}
            cy={`${center.y}%`}
            r="12%"
            fill="none"
            stroke="#f59e0b"
            strokeOpacity="0.25"
            strokeWidth="0.3"
            strokeDasharray="1 1.5"
          />
        </svg>

        {/* CENTER NODE: "شیخ" BRAND EMBLEM */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full pointer-events-none"
          style={{
            left: `${center.x}%`,
            top: `${center.y}%`,
            width: '68px',
            height: '68px',
          }}
        >
          {/* Ambient Outer Ring Glow */}
          <div className="absolute -inset-2 rounded-full bg-amber-500/15 blur-md motion-safe:animate-pulse" />

          {/* Golden Border Ring 1 */}
          <div className="absolute inset-0 rounded-full border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]" />

          {/* Inner Disc */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-950/90 via-stone-950 to-amber-900/80 border-2 border-amber-400/60 shadow-inner flex flex-col items-center justify-center p-1">
            {/* Gold Calligraphic Sheikh Text */}
            <span className="text-xl font-black bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-vazirmatn tracking-tight">
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
                className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                }}
              >
                {/* Glassmorphic Category Circle */}
                <div
                  className="relative flex flex-col items-center justify-center rounded-full bg-stone-950/85 border border-amber-500/35 group-hover:border-amber-300 group-hover:bg-stone-900/90 shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 backdrop-blur-md"
                  style={{
                    width: '52px',
                    height: '52px',
                    boxShadow: `0 0 10px ${node.color}25`,
                  }}
                >
                  {/* Subtle Inner Glow */}
                  <div
                    className="absolute inset-0 rounded-full opacity-15 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: node.color }}
                  />

                  {/* Icon */}
                  <IconComponent
                    className="w-4 h-4 mb-0.5 text-amber-200 group-hover:text-amber-100 transition-colors"
                    aria-hidden="true"
                  />

                  {/* Category Label */}
                  <span className="text-[8.5px] font-bold text-amber-100/95 group-hover:text-white transition-colors font-vazirmatn text-center leading-tight max-w-[46px] truncate px-0.5">
                    {node.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* BOTTOM CALL TO ACTION BADGE */}
        <div className="mt-auto mb-1 text-center relative z-20">
          <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-stone-900/80 border border-amber-500/25 shadow-md backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 motion-safe:animate-ping" />
            <span className="text-[11px] font-medium text-amber-200/90 font-vazirmatn">
              برای ورود به دسته‌بندی مورد نظر لمس کنید
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
