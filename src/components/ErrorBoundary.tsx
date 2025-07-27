'use client';

import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch() {
        // Log error to an error reporting service
        // In production, this should be sent to a proper error tracking service
        // console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                            <p className="text-gray-300 mb-4">
                                We&apos;re sorry, but something unexpected happened. Please refresh the page or try again later.
                            </p>
                            {this.state.error && (
                                <details className="text-left bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                    <summary className="text-amber-300 font-medium cursor-pointer mb-2">
                                        Error Details
                                    </summary>
                                    <pre className="text-xs text-gray-400 overflow-auto">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
                            >
                                Refresh Page
                            </button>

                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 font-medium py-3 px-6 rounded-xl"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 