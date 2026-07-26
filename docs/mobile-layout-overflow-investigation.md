# Root Cause Investigation Report: Mobile Layout Horizontal Overflow

## Timeline of the Investigation
1. **Initial Load (SSR):** Page loads with `dir="rtl"`. Layout looks normal, but as soon as the client bundle loads, hydration begins.
2. **Hydration starts:** `AccessibilityEnhancements` client component mounts.
3. **Dynamic Elements Mount:** The script executes `useEffect`, dynamically creating a "Skip to main content" link and prepending it to `document.body`.
4. **ScrollWidth changes from 375 to 10375:** The newly created skip link has its `left` style explicitly set to `-9999px`. Because the document is in RTL mode, translating a component negative 10,000 pixels to the left causes the browser's layout engine to extend the total scrollable area to the left by 10,000px, leading to a massive horizontal overflow.
5. **Component Mounted:** LayoutDebugger detects the overflow and logs the offending element.
6. **Root Cause Identified:** The `AccessibilityEnhancements.tsx` skip-link positioning is the exact culprit.

---

## Root Cause Details
- **Component:** `AccessibilityEnhancements`
- **File:** `src/components/accessibility/AccessibilityEnhancements.tsx`
- **DOM Node:** `<a href="#main-content" class="sr-only ...">Skip to main content</a>`
- **Reason:** Setting `style.left = '-9999px'` in an RTL context (`dir="rtl"`) extends the document's boundary to the left, which results in a horizontal layout scrollWidth of exactly `window.innerWidth + 10000px` (e.g. `375px + 10000px = 10375px`).
- **Proof:**
  - **Before isolating / fixing:**
    `window.innerWidth = 375`
    `document.documentElement.scrollWidth = 10375`
    `document.body.scrollWidth = 375`
  - **Identified Offender:**
    `[Offender #2] Index in DOM: 86 | <a>`
    - ClassName: `"sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded z-50"`
    - Metrics: `scrollWidth=174px`, `rectLeft=-10000px`, `rectRight=-9968px`
    - Styles: `position=absolute`, `left=-9999px`, `right=10344px`

---

## Why Previous Fixes Failed
Previous attempts focused exclusively on R3F Canvas elements, ResizeObservers, shimmer animations, and viewport config. However, the skip-to-content link is injected directly into `document.body` as a first-child, completely bypassing standard layout wrappers and viewport overflow-hidden rules applied to inner page containers. Since it was an accessibility utility, it went completely unnoticed by typical visual debugging.

---

## Minimal Patch Propose
Remove the explicit `style.left = '-9999px'` assignment. The Tailwind `sr-only` class is already designed to perfectly and accessibly hide the element within a `1x1` pixel clip path, without relying on off-screen left/right translation. When focused, the `focus:not-sr-only` and `focus:left-4` classes bring it into view correctly at the top-left of the screen.
