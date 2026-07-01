import React, { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Error caught by boundary:', error);
      setHasError(true);
      setError(error);
    };

    const originalHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (error) {
        handleError(error);
      }
      if (originalHandler) {
        return originalHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    return () => {
      window.onerror = originalHandler;
    };
  }, []);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    window.location.reload();
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            حدث خطأ غير متوقع
          </h2>
          
          <p className="text-gray-400 mb-6">
            نأسف لهذا الخطأ. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-right">
              <p className="text-red-400 text-sm font-mono">
                {error.message}
              </p>
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <RefreshCw size={20} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
