import { useState, useCallback } from 'react';

const useErrorHandler = (initialError = '') => {
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error) => {
    if (error?.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password');
          break;
        case 'auth/email-already-in-use':
          setError('Email already in use');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'storage/unauthorized':
          setError('You don\'t have permission to perform this action');
          break;
        case 'storage/quota-exceeded':
          setError('Storage quota exceeded. Please try again later');
          break;
        default:
          setError(error.message || 'An unexpected error occurred');
      }
    } else if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const withErrorHandling = useCallback(async (asyncFn) => {
    try {
      setLoading(true);
      clearError();
      await asyncFn();
    } catch (error) {
      handleError(error);
      throw error; // Re-throw to be caught by ErrorBoundary if needed
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    withErrorHandling,
    loading,
    setLoading
  };
};

export default useErrorHandler; 