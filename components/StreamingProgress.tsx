'use client';

import { useEffect, useState } from 'react';

interface Props {
  isStreaming: boolean;
  streamedLength: number;
}

export default function StreamingProgress({ isStreaming, streamedLength }: Props) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  if (!isStreaming) return null;

  return (
    <div className="fixed bottom-8 right-8 bg-white rounded-xl shadow-2xl p-4 border-2 border-brand-primary animate-fade-in z-40">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 gradient-brand rounded-full animate-pulse"></div>
          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        
        <div>
          <div className="font-semibold text-brand-dark">
            Streaming AI Response{dots}
          </div>
          <div className="text-sm text-gray-600">
            {streamedLength > 0 ? `${Math.floor(streamedLength / 100)} words generated` : 'Starting...'}
          </div>
        </div>
      </div>
      
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full gradient-brand transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, (streamedLength / 20000) * 100)}%` }}
        />
      </div>
    </div>
  );
}

