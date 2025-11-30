'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseScrollAnimationOptions {
    threshold?: number;
    triggerOnce?: boolean;
    rootMargin?: string;
    delay?: number;
    duration?: number;
    easing?: string;
    direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    triggerOnce = true,
    rootMargin = '0px',
    delay = 0,
    duration = 700,
    easing = 'ease-out',
    direction = 'up',
  } = options;

  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
    rootMargin,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [inView, delay]);

  const getAnimationClass = () => {
    if (!isVisible) {
      const baseClasses = 'transition-all duration-700 ease-out';
      const hiddenClasses = {
        up: 'opacity-0 translate-y-8',
        down: 'opacity-0 -translate-y-8',
        left: 'opacity-0 -translate-x-8',
        right: 'opacity-0 translate-x-8',
        scale: 'opacity-0 scale-95',
        fade: 'opacity-0',
      };
      return `${baseClasses} ${hiddenClasses[direction]}`;
    }

    const visibleClasses = {
      up: 'opacity-100 translate-y-0',
      down: 'opacity-100 translate-y-0',
      left: 'opacity-100 translate-x-0',
      right: 'opacity-100 translate-x-0',
      scale: 'opacity-100 scale-100',
      fade: 'opacity-100',
    };
    return `transition-all duration-700 ease-out ${visibleClasses[direction]}`;
  };

  return {
    ref,
    inView,
    isVisible,
    className: getAnimationClass(),
    style: {
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: easing,
    },
  };
}

// Parallax scroll hook
export function useParallaxScroll(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setOffset(window.pageYOffset * speed);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frame.current);
    };
  }, [speed]);

  return offset;
}

// Smooth scroll hook
export function useSmoothScroll() {
  const scrollTo = (target: string | HTMLElement, options?: ScrollToOptions) => {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return { scrollTo, scrollToTop };
}
