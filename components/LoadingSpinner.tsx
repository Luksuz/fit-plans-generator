'use client';

interface Props {
  message?: string;
  submessage?: string;
  progress?: number;
  progressText?: string;
}

export default function LoadingSpinner({ message = 'Generating...', submessage, progress, progressText }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 gradient-brand rounded-full animate-pulse-slow opacity-20"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-brand-primary animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-brand-dark mb-2 text-center">
            {message}
          </h3>
          
          {submessage && (
            <p className="text-gray-600 text-center mb-4">{submessage}</p>
          )}

          {progress !== undefined && progress > 0 ? (
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{progressText || 'Processing...'}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full gradient-brand transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-2 mt-4">
              <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-6 text-center">
            {progress !== undefined && progress > 0 
              ? 'Streaming AI generation in real-time...'
              : 'This may take 30-60 seconds. Please don\'t close this window.'}
          </p>
        </div>
      </div>
    </div>
  );
}
