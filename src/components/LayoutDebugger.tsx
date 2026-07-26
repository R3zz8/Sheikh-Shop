'use client';

import { useEffect, useRef } from 'react';

export default function LayoutDebugger() {
  const isSearchMountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scanDOM = (contextName: string = '') => {
      const docWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const viewportWidth = window.innerWidth;

      // Check if EnhancedAISearch input or container is in DOM
      const searchElement = document.querySelector('input[placeholder*="جستجو با هوش"]');
      const isSearchPresent = !!searchElement;

      if (isSearchPresent !== isSearchMountedRef.current) {
        console.log(
          `[LAYOUT DEBUGGER] [STATE CHANGED] EnhancedAISearch mounted state went from ${isSearchMountedRef.current} to ${isSearchPresent}. ` +
          `scrollWidth before check: docWidth=${docWidth}px, bodyWidth=${bodyWidth}px, viewport=${viewportWidth}px`
        );
        isSearchMountedRef.current = isSearchPresent;
      }

      if (docWidth <= viewportWidth && bodyWidth <= viewportWidth) {
        return;
      }

      console.log(
        `[LAYOUT DEBUGGER] ${contextName ? `[${contextName}] ` : ''}OVERFLOW DETECTED: ` +
        `viewport=${viewportWidth}px, docWidth=${docWidth}px, bodyWidth=${bodyWidth}px, isSearchPresent=${isSearchPresent}`
      );

      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        // Check if element is wider than viewport, or if its right side extends past viewport
        const isWiderThanViewport = el.scrollWidth > viewportWidth || el.clientWidth > viewportWidth || rect.width > viewportWidth;
        const extendsPastRight = rect.right > viewportWidth;

        if (isWiderThanViewport || extendsPastRight) {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const classes = el.className ? `.${Array.from(el.classList).join('.')}` : '';

          // Construct ancestor chain
          const ancestry: string[] = [];
          let parent = el.parentElement;
          while (parent) {
            ancestry.push(`${parent.tagName.toLowerCase()}${parent.id ? '#' + parent.id : ''}${parent.className ? '.' + Array.from(parent.classList).slice(0, 2).join('.') : ''}`);
            parent = parent.parentElement;
          }

          console.log(
            `[LAYOUT DEBUGGER] OFFENDING NODE: <${tag}${id}${classes}>\n` +
            `  - Parent chain: ${ancestry.reverse().join(' > ')}\n` +
            `  - Width: scrollWidth=${el.scrollWidth}px, clientWidth=${el.clientWidth}px, offsetWidth=${(el as HTMLElement).offsetWidth || 0}px, rectWidth=${rect.width}px\n` +
            `  - Position: rectLeft=${rect.left}px, rectRight=${rect.right}px, top=${rect.top}px\n` +
            `  - CSS Styles: position=${style.position}, display=${style.display}, overflow=${style.overflow}, overflowX=${style.overflowX}, ` +
            `transform=${style.transform}, translate=${style.translate}, flex-basis=${style.flexBasis}, min-width=${style.minWidth}, max-width=${style.maxWidth}, width=${style.width}`
          );
        }
      });
    };

    // Fast scanning loops to catch hydration and mount timings
    scanDOM('initial_ssr_or_mount');

    // Set up intervals to scan during hydration
    const intervals = [100, 200, 500, 1000, 2000, 4000, 6000, 8000, 10000];
    const timers = intervals.map((delay) =>
      setTimeout(() => scanDOM(`hydration_delay_${delay}ms`), delay)
    );

    const onResize = () => scanDOM('resize_event');
    const onScroll = () => scanDOM('scroll_event');
    const onOrientationChange = () => scanDOM('orientation_change_event');
    const onMutation = () => scanDOM('dom_mutation');

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('orientationchange', onOrientationChange);

    const observer = new MutationObserver(onMutation);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('orientationchange', onOrientationChange);
      observer.disconnect();
    };
  }, []);

  return null;
}
