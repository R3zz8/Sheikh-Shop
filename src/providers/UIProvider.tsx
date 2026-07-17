'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface UIContextType {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const setMobileMenuOpen = useCallback((isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <UIContext.Provider value={{ isMobileMenuOpen, setMobileMenuOpen, toggleMobileMenu }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
}
