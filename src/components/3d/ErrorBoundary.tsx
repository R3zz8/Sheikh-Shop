'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[3D_SCENE_ERROR_BOUNDARY]', error, errorInfo);
    }
  }

  public override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full min-h-[300px] bg-stone-900/60 rounded-2xl flex items-center justify-center p-6 border border-amber-500/20">
          <div className="text-center">
            <p className="text-amber-200/80 font-medium text-sm font-vazirmatn">خطا در بارگذاری جلوه سه بعدی</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
