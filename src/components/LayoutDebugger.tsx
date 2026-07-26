'use client';

import { useEffect, useRef } from 'react';
import { isLayoutDebugEnabled } from '@/utils/layoutDebug';

export default function LayoutDebugger() {
  const isSearchMountedRef = useRef(false);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if layout debugging is enabled. If not, do nothing!
    if (!isLayoutDebugEnabled()) {
      return;
    }

    console.log('[LAYOUT DEBUGGER] Initialized. Diagnostic monitoring is ACTIVE.');

    const logViewportMetrics = (phase: string) => {
      const docWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const viewportWidth = window.innerWidth;
      const vvWidth = window.visualViewport ? window.visualViewport.width : 'N/A';
      const vvScale = window.visualViewport ? window.visualViewport.scale : 'N/A';

      console.log(
        `[LAYOUT DEBUGGER] [METRICS] Phase: ${phase} | ` +
        `window.innerWidth=${viewportWidth}px, ` +
        `document.body.scrollWidth=${bodyWidth}px, ` +
        `document.documentElement.scrollWidth=${docWidth}px, ` +
        `visualViewport.width=${vvWidth}, ` +
        `visualViewport.scale=${vvScale}`
      );
    };

    const getStackingContextReason = (el: HTMLElement, style: CSSStyleDeclaration): string | null => {
      if (style.position !== 'static' && style.zIndex !== 'auto') {
        return `positioned element with z-index (${style.position}, z-index: ${style.zIndex})`;
      }
      if (style.position === 'fixed' || style.position === 'sticky') {
        return `fixed or sticky positioned element (${style.position})`;
      }
      if (parseFloat(style.opacity || '1') < 1) {
        return `opacity less than 1 (opacity: ${style.opacity})`;
      }
      if (style.transform && style.transform !== 'none') {
        return `transform (transform: ${style.transform})`;
      }
      if (style.mixBlendMode && style.mixBlendMode !== 'normal') {
        return `mix-blend-mode (mixBlendMode: ${style.mixBlendMode})`;
      }
      if (style.filter && style.filter !== 'none') {
        return `filter (filter: ${style.filter})`;
      }
      if (style.perspective && style.perspective !== 'none') {
        return `perspective (perspective: ${style.perspective})`;
      }
      if (style.clipPath && style.clipPath !== 'none') {
        return `clip-path (clipPath: ${style.clipPath})`;
      }
      return null;
    };

    const scanDOM = (contextName: string = '') => {
      const docWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const viewportWidth = window.innerWidth;

      // Check for EnhancedAISearch presence
      const searchElement = document.querySelector('input[placeholder*="جستجو با هوش"]');
      const isSearchPresent = !!searchElement;

      if (isSearchPresent !== isSearchMountedRef.current) {
        console.log(
          `[LAYOUT DEBUGGER] [STATE CHANGED] EnhancedAISearch mounted state went from ${isSearchMountedRef.current} to ${isSearchPresent}.`
        );
        isSearchMountedRef.current = isSearchPresent;
        logViewportMetrics(`aisearch_state_changed_to_${isSearchPresent}`);
      }

      logViewportMetrics(contextName);

      if (docWidth <= viewportWidth && bodyWidth <= viewportWidth) {
        return;
      }

      console.warn(
        `[LAYOUT DEBUGGER] [OVERFLOW DETECTED] Context: [${contextName}] | ` +
        `viewport=${viewportWidth}px, docWidth=${docWidth}px, bodyWidth=${bodyWidth}px`
      );

      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        // Check if element is wider than viewport, or if its right side extends past viewport
        const isWiderThanViewport = el.scrollWidth > viewportWidth || el.clientWidth > viewportWidth || rect.width > viewportWidth;
        const extendsPastRight = rect.right > viewportWidth;

        if (isWiderThanViewport || extendsPastRight) {
          const htmlEl = el as HTMLElement;
          const tag = htmlEl.tagName.toLowerCase();
          const id = htmlEl.id ? `#${htmlEl.id}` : '';
          const classes = htmlEl.className ? `.${Array.from(htmlEl.classList).join('.')}` : '';

          // Determine React component from key if present
          let reactComponent = 'Unknown';
          const reactKeys = Object.keys(htmlEl);
          const reactPropKey = reactKeys.find(
            k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
          );
          if (reactPropKey) {
            const fiber = (htmlEl as any)[reactPropKey];
            let current = fiber;
            while (current) {
              if (current.type && typeof current.type === 'function' && current.type.name) {
                reactComponent = current.type.name;
                break;
              }
              current = current.return;
            }
          }

          // Construct ancestor chain and find stacking contexts
          const ancestry: string[] = [];
          const stackingContexts: string[] = [];
          let parent = htmlEl.parentElement;
          while (parent) {
            const pStyle = window.getComputedStyle(parent);
            const parentSelector = `${parent.tagName.toLowerCase()}${parent.id ? '#' + parent.id : ''}${parent.className ? '.' + Array.from(parent.classList).slice(0, 2).join('.') : ''}`;
            ancestry.push(parentSelector);

            const reason = getStackingContextReason(parent, pStyle);
            if (reason) {
              stackingContexts.push(`${parentSelector} due to ${reason}`);
            }
            parent = parent.parentElement;
          }

          console.warn(
            `[LAYOUT DEBUGGER] [OFFENDING NODE] <${tag}${id}${classes}>\n` +
            `  - React Component Name: ${reactComponent}\n` +
            `  - Parent chain: ${ancestry.reverse().join(' > ')}\n` +
            `  - Stacking Context Ancestors: [${stackingContexts.join(' | ')}]\n` +
            `  - Width: scrollWidth=${htmlEl.scrollWidth}px, clientWidth=${htmlEl.clientWidth}px, offsetWidth=${htmlEl.offsetWidth || 0}px, rectWidth=${rect.width}px\n` +
            `  - Position: rectLeft=${rect.left}px, rectRight=${rect.right}px, top=${rect.top}px\n` +
            `  - CSS Styles: position=${style.position}, display=${style.display}, overflow=${style.overflow}, overflowX=${style.overflowX}, ` +
            `transform=${style.transform}, translate=${style.translate}, flex-basis=${style.flexBasis}, min-width=${style.minWidth}, max-width=${style.maxWidth}, width=${style.width}, zIndex=${style.zIndex}`
          );
        }
      });
    };

    // Before hydration timing
    logViewportMetrics('before_hydration');

    // Run first scan immediately
    scanDOM('initial_ssr_or_mount');
    isHydratedRef.current = true;
    logViewportMetrics('after_hydration');

    // Fast scanning loops to catch hydration and mount timings
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
