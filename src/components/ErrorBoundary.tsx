import { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

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
      console.error('Error stack:', error.stack);
      setHasError(true);
      setError(error);
    };

    const originalHandler = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', { message, source, lineno, colno, error });
      if (error) {
        handleError(error);
      }
      if (originalHandler) {
        return originalHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      if (event.reason instanceof Error) {
        handleError(event.reason);
      }
    });

    return () => {
      window.onerror = originalHandler;
    };
  }, []);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    window.location.reload();
  };

  const handleGoHome = () => {
    setHasError(false);
    setError(null);
    window.location.href = '/';
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden" dir="rtl">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
              {/* Animated Icon */}
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30 shadow-xl shadow-red-500/20"
              >
                <AlertCircle size={48} className="text-red-400" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
              >
                حدث خطأ غير متوقع
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-400 mb-6 text-lg"
              >
                نأسف لهذا الخطأ. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.
              </motion.p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-right"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bug size={16} className="text-red-400" />
                    <span className="text-red-400 text-sm font-semibold">تفاصيل الخطأ</span>
                  </div>
                  <p className="text-red-300 text-sm font-mono">
                    {error.message}
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-red-500/30"
                >
                  <RefreshCw size={20} />
                  إعادة المحاولة
                </button>

                <button
                  onClick={handleGoHome}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  <Home size={20} />
                  العودة للصفحة الرئيسية
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm"
              >
                <Sparkles size={14} className="text-purple-400" />
                <span>نحن نعمل على تحسين التجربة</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
