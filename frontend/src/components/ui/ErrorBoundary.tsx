"use client";

import { Component, ErrorInfo, ReactNode, useState } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    // يمكن إرسال الخطأ إلى نظام مراقبة مثل Sentry
    if (typeof window !== 'undefined') {
      const sentry = (window as { Sentry?: { captureException: (e: Error) => void } }).Sentry;
      sentry?.captureException(error);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-primary/5 p-4 text-right" dir="rtl">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Icon */}
            <div className="relative">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-card rounded-full flex items-center justify-center shadow-md">
                <Home size={20} className="text-primary dark:text-ink" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h1 className="text-2xl lg:text-3xl font-black text-primary dark:text-ink">
                حدث خطأ غير متوقع
              </h1>
              <p className="text-gray-600 dark:text-muted font-medium">
                نأسف، واجهنا مشكلة أثناء تحميل الصفحة. 
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 dark:bg-red-500/15 border border-red-200 rounded-2xl p-4 text-right text-sm font-mono text-red-700">
                  <div className="font-bold mb-2">تفاصيل الخطأ:</div>
                  <div className="break-all">{this.state.error.message}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-secondary hover:text-primary transition-all active:scale-95"
              >
                <RefreshCw size={20} className="animate-spin" />
                إعادة المحاولة
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-card text-primary dark:text-ink border-2 border-primary rounded-2xl font-black text-lg hover:bg-primary/5 transition-all active:scale-95"
              >
                <Home size={20} />
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook مساعد لاستخدام Error Boundary بسهولة
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);
  
  const resetError = () => setError(null);
  
  return { error, resetError };
}