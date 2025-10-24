// tests/__mocks__/framer-motion.tsx
import React from 'react';

export const motion = {
  div: React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  )),
  h2: React.forwardRef<HTMLHeadingElement, { children: React.ReactNode }>(({ children, ...props }, ref) => (
    <h2 {...props} ref={ref}>
      {children}
    </h2>
  ))
};
