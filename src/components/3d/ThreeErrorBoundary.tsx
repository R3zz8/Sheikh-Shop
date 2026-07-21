'use client';

import React, { Component, type ReactNode } from 'react';
import StaticLuxuryUnboxingFallback from './StaticLuxuryUnboxingFallback';

interface Props {
  children: ReactNode;
  fallbackProduct: {
    id: string;
    name: string;
    slug?: string | null;
    basePrice: number;
    images?: Array<{ image?: string | null; secureUrl?: string | null }> | null;
  };
  onClose?: () => void;
  config?: any;
}

interface State {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ThreeJS/WebGL error handled by boundary:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <StaticLuxuryUnboxingFallback
          product={this.props.fallbackProduct}
          onClose={this.props.onClose}
          config={this.props.config}
        />
      );
    }

    return this.props.children;
  }
}

export default ThreeErrorBoundary;
