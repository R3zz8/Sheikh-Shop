// tests/__mocks__/framer-motion.tsx
import React from 'react';

export const motion = {
  div: React.forwardRef(({ children, ...props }, ref) => (
    <div {...props} ref={ref as React.Ref<HTMLDivElement>}>
      {children}
    </div>
  )),
};
