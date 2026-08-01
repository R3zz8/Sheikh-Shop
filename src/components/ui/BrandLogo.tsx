'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function BrandLogo({ size = 120, className = '', animate = true }: BrandLogoProps) {
  return (
    <motion.div
      initial={animate ? { scale: 0.92, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: size, height: size }}
      className={`relative select-none pointer-events-none ${className}`.trim()}
    >
      {/* Ambient Breathing Gold Glow under the Logo */}
      {animate && (
        <motion.div
          animate={{
            scale: [1, 1.15, 0.95, 1],
            opacity: [0.12, 0.22, 0.12, 0.12],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"
        />
      )}

      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <radialGradient id="logo-bg-radial" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#1e0a02"/>
            <stop offset="60%" stop-color="#090301"/>
            <stop offset="100%" stop-color="#020100"/>
          </radialGradient>

          <linearGradient id="logo-gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffe596"/>
            <stop offset="25%" stop-color="#d4af37"/>
            <stop offset="50%" stop-color="#8a6713"/>
            <stop offset="75%" stop-color="#e6c460"/>
            <stop offset="100%" stop-color="#ffe596"/>
          </linearGradient>

          <linearGradient id="logo-amber-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
            <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
          </linearGradient>

          <linearGradient id="logo-bronze-dark" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#3a1b07"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>

          <filter id="logo-luxury-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
          </filter>

          <filter id="logo-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>

          <linearGradient id="logo-glass-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
            <stop offset="35%" stop-color="#ffffff" stop-opacity="0.08"/>
            <stop offset="45%" stop-color="#ffffff" stop-opacity="0"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <rect width="504" height="504" x="4" y="4" rx="124" fill="url(#logo-bg-radial)" filter="url(#logo-luxury-shadow)" />

        <rect width="492" height="492" x="10" y="10" rx="118" fill="none" stroke="url(#logo-gold-metallic)" stroke-width="2.5" opacity="0.35" />
        <rect width="476" height="476" x="18" y="18" rx="110" fill="none" stroke="url(#logo-gold-metallic)" stroke-width="4.5" opacity="0.8" />

        <circle cx="256" cy="256" r="160" fill="url(#logo-amber-glow)" filter="url(#logo-gold-glow)" pointer-events="none" />

        <path d="M 120,135 C 115,150 120,170 135,180 C 145,185 160,180 165,165 C 170,150 160,130 145,125 C 135,120 125,125 120,135 Z M 132,142 C 140,140 152,148 152,158 C 152,165 142,170 138,162 C 134,154 130,146 132,142 Z" fill="url(#logo-gold-metallic)" opacity="0.4" />

        <path d="M 370,125 L 390,135 L 390,155 L 370,165 L 350,155 L 350,135 Z M 356,139 L 356,151 L 370,159 L 384,151 L 384,139 L 370,131 Z" fill="url(#logo-gold-metallic)" opacity="0.4" />

        <path d="M 125,365 L 145,345 L 165,365 L 165,385 L 125,385 Z M 135,375 L 135,380 L 145,380 L 145,370 Z" fill="none" stroke="url(#logo-gold-metallic)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />

        <path d="M 355,355 L 385,355 L 390,385 L 350,385 Z M 362,355 C 362,345 378,345 378,355" fill="none" stroke="url(#logo-gold-metallic)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />

        <path d="M 256,40 Q 256,52 268,52 Q 256,52 256,64 Q 256,52 244,52 Q 256,52 256,40" fill="url(#logo-gold-metallic)" filter="url(#logo-gold-glow)" />
        <path d="M 95,240 Q 95,248 103,248 Q 95,248 95,256 Q 95,248 87,248 Q 95,248 95,240" fill="url(#logo-gold-metallic)" opacity="0.8" />
        <path d="M 415,240 Q 415,248 423,248 Q 415,248 415,256 Q 415,248 407,248 Q 415,248 415,240" fill="url(#logo-gold-metallic)" opacity="0.8" />

        <g filter="url(#logo-luxury-shadow)">
          <path d="M 196,165 C 210,170 302,170 316,165 C 316,161 310,154 300,152 C 285,149 227,149 212,152 C 202,154 196,161 196,165 Z" fill="url(#logo-bronze-dark)" />
          <path d="M 200,163 C 215,167 297,167 312,163 L 314,157 C 299,161 213,161 198,157 Z" fill="url(#logo-gold-metallic)" />
          <circle cx="215" cy="160" r="2.5" fill="#ffffff" opacity="0.9" />
          <circle cx="235" cy="161.5" r="2.5" fill="#ffffff" opacity="0.9" />
          <circle cx="256" cy="162" r="2.5" fill="#ffffff" opacity="0.9" />
          <circle cx="277" cy="161.5" r="2.5" fill="#ffffff" opacity="0.9" />
          <circle cx="297" cy="160" r="2.5" fill="#ffffff" opacity="0.9" />

          <path d="M 200,157 L 204,115 L 228,135 L 256,105 L 284,135 L 308,115 L 312,157 Z" fill="url(#logo-bronze-dark)" opacity="0.5" />

          <path d="M 198,157 C 200,145 204,115 204,115 L 230,138 L 256,108 L 282,138 L 308,115 C 308,115 312,145 314,157 C 295,162 217,162 198,157 Z" fill="url(#logo-gold-metallic)" />

          <path d="M 204,115 L 207,135 L 230,138 Z" fill="#ffffff" opacity="0.25" />
          <path d="M 256,108 L 251,135 L 261,135 Z" fill="#ffffff" opacity="0.3" />
          <path d="M 308,115 L 305,135 L 282,138 Z" fill="#ffffff" opacity="0.25" />

          <circle cx="204" cy="113" r="5" fill="url(#logo-gold-metallic)" filter="url(#logo-gold-glow)" />
          <circle cx="230" cy="136" r="4" fill="url(#logo-gold-metallic)" />
          <circle cx="256" cy="105" r="7" fill="url(#logo-gold-metallic)" filter="url(#logo-gold-glow)" />
          <circle cx="282" cy="136" r="4" fill="url(#logo-gold-metallic)" />
          <circle cx="308" cy="113" r="5" fill="url(#logo-gold-metallic)" filter="url(#logo-gold-glow)" />
        </g>

        <g filter="url(#logo-luxury-shadow)">
          <path d="M 264,188
                   C 214,188 186,212 186,242
                   C 186,290 248,294 248,322
                   C 248,338 232,348 214,348
                   C 192,348 184,332 184,324
                   L 174,324
                   C 174,346 194,362 218,362
                   C 268,362 298,336 298,306
                   C 298,256 236,252 236,226
                   C 236,212 250,202 268,202
                   C 288,202 296,216 296,228
                   L 306,228
                   C 306,204 288,188 264,188 Z"
                fill="url(#logo-bronze-dark)"
                transform="translate(0, 4)" />

          <path d="M 264,188
                   C 214,188 186,212 186,242
                   C 186,290 248,294 248,322
                   C 248,338 232,348 214,348
                   C 192,348 184,332 184,324
                   L 174,324
                   C 174,346 194,362 218,362
                   C 268,362 298,336 298,306
                   C 298,256 236,252 236,226
                   C 236,212 250,202 268,202
                   C 288,202 296,216 296,228
                   L 306,228
                   C 306,204 288,188 264,188 Z"
                fill="url(#logo-gold-metallic)" />

          <path d="M 264,192 C 224,192 194,212 194,242 C 194,272 225,280 238,288" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3" />
          <path d="M 234,310 C 244,320 244,334 244,340 C 244,344 236,354 218,354 C 198,354 188,340 186,328" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.25" />
        </g>

        <path d="M 10,120
                 C 150,40 360,40 502,120
                 C 502,120 380,260 256,260
                 C 132,260 10,120 10,120 Z"
              fill="url(#logo-glass-shimmer)"
              pointer-events="none" />
      </svg>
    </motion.div>
  );
}
