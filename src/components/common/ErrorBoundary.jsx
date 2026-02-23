import React from 'react';
import { MdErrorOutline } from 'react-icons/md';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <MdErrorOutline className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-xl font-semibold text-slate-900 m-0 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-500 mb-8 max-w-md">
              We&apos;re sorry, but something unexpected happened. Please try again.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-primary px-4 py-2 rounded-md text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
