import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console (and external service in production)
    console.error('Uncaught error:', error, errorInfo);
    
    // In production, send to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReport = () => {
    // Optional: Open email or form for reporting
    window.location.href = 'mailto:support@cocoaflow.com?subject=Error Report';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FFF5E6] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full shadow-lg rounded-lg p-8 text-center">
            {/* Chocolate-themed Illustration */}
            <svg
              className="mx-auto mb-6 w-24 h-24 text-[#4B2E2A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Error illustration"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7zm2 2v6h6V9H9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l3 3M9 15l3-3" />
            </svg>

            <h1 className="text-[#4B2E2A] text-3xl font-bold mb-4">Oops! Something Melted</h1>
            <p className="text-[#4B2E2A] text-lg mb-6">
              Looks like our chocolate factory hit a snag. We're sorry for the inconvenience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-[#4B2E2A] text-white py-3 px-6 rounded font-semibold hover:bg-[#3A221F]"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReport}
                className="border border-[#4B2E2A] text-[#4B2E2A] py-3 px-6 rounded font-semibold hover:bg-[#FFF5E6]"
              >
                Report Error
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
