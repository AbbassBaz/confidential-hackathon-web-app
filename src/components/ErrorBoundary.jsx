import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { ErrorIcon, HomeIcon } from './icons';
import '../styles/common.css';

const RefreshIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
  </svg>
);

const DefaultErrorElement = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again later.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page not found';
      message = 'The page you\'re looking for doesn\'t exist or has been moved.';
    } else if (error.status === 401) {
      title = 'Unauthorized';
      message = 'You need to be logged in to access this page.';
    } else if (error.status === 403) {
      title = 'Access denied';
      message = 'You don\'t have permission to access this page.';
    } else {
      title = `Error ${error.status}`;
      message = error.statusText || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center">
          <ErrorIcon className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-lg text-gray-600">{message}</p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="btn-indigo flex items-center justify-center"
          >
            <RefreshIcon className="icon-sm mr-2" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="success-link"
          >
            <HomeIcon className="icon-sm mr-2" />
            Back to Home
          </button>
        </div>

        {error instanceof Error && process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-mono text-gray-700 break-all">
              {error.stack}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <DefaultErrorElement />;
    }

    return this.props.children;
  }
}

export { ErrorBoundary, DefaultErrorElement }; 