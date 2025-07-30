'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse" />
    );
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          'relative w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20',
          'hover:bg-white/20 hover:border-white/30 transition-all duration-300',
          'focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          'touch-feedback',
        )}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="relative w-5 h-5">
          {/* Sun icon */}
          <Sun
            className={cn(
              'absolute inset-0 w-5 h-5 transition-all duration-500',
              theme === 'light'
                ? 'text-yellow-500 rotate-0 scale-100'
                : 'text-gray-400 -rotate-90 scale-0',
            )}
          />
          {/* Moon icon */}
          <Moon
            className={cn(
              'absolute inset-0 w-5 h-5 transition-all duration-500',
              theme === 'dark'
                ? 'text-blue-400 rotate-0 scale-100'
                : 'text-gray-400 rotate-90 scale-0',
            )}
          />
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
      </div>
    </div>
  );
};
