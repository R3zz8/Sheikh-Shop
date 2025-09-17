'use client';

import { useEffect } from 'react';

export default function AccessibilityEnhancements() {
  useEffect(() => {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded z-50';
    skipLink.style.position = 'absolute';
    skipLink.style.left = '-9999px';
    skipLink.style.zIndex = '9999';
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add focus management for modals and dropdowns
    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const activeElement = document.activeElement;
        const modal = activeElement?.closest('[role="dialog"]');
        
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            if (activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);

    // Add reduced motion support
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--animation-iteration-count', '1');
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--animation-iteration-count');
      }
    };

    mediaQuery.addEventListener('change', handleMotionPreference);
    handleMotionPreference({ matches: mediaQuery.matches } as MediaQueryListEvent);

    // Add high contrast mode support
    const handleHighContrast = () => {
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      if (prefersHighContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addEventListener('change', handleHighContrast);
    handleHighContrast();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
      mediaQuery.removeEventListener('change', handleMotionPreference);
      contrastQuery.removeEventListener('change', handleHighContrast);
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  return null;
}

// Utility function to announce changes to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
}

// Utility function to manage focus
export function manageFocus(element: HTMLElement | null) {
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Utility function to check if element is visible to screen readers
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}
