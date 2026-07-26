/**
 * Layout Debugger and Component Isolation Utilities
 * For Phase 1 & Phase 4 investigation.
 */

export function isLayoutDebugEnabled(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_LAYOUT_DEBUG === 'true';
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('layoutDebug') === 'true' || params.has('layoutDebug')) {
      return true;
    }
    if (localStorage.getItem('layoutDebug') === 'true') {
      return true;
    }
  } catch (e) {}

  return process.env.NEXT_PUBLIC_LAYOUT_DEBUG === 'true' || process.env.NODE_ENV === 'development';
}

export function getIsIsolated(componentName: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    const isolateParam = params.get('isolate') || '';
    const isolatedComponents = isolateParam.split(',').map(s => s.trim().toLowerCase());

    if (isolatedComponents.includes(componentName.toLowerCase()) || isolatedComponents.includes('all')) {
      console.log(`[LAYOUT DEBUGGER] Conditionally isolating component: ${componentName}`);
      return true;
    }

    if (localStorage.getItem(`isolate_${componentName.toLowerCase()}`) === 'true') {
      console.log(`[LAYOUT DEBUGGER] Conditionally isolating component: ${componentName} via localStorage`);
      return true;
    }
  } catch (e) {}

  return false;
}
