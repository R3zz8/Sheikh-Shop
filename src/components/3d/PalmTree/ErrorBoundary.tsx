'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    public componentDidCatch() {
        // Log error to an error reporting service in production
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-b from-green-600 to-green-800 rounded-full mx-auto mb-4 relative">
                            {/* Static palm tree */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {[...Array(8)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-8 bg-green-600 rounded-full origin-bottom"
                                        style={{
                                            transform: `rotate(${(i * 45)}deg) translateY(-20px)`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="w-4 h-16 bg-amber-800 rounded-full mx-auto"></div>
                        <p className="text-amber-700 font-medium mt-4">Date Palm Tree</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 