'use client';
import { useState, useEffect } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
      <div className="w-full max-w-md px-6 py-8 flex flex-col items-center">
        {/* Logo/Brand Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-teal-100 opacity-50 animate-pulse"></div>
          <div className="relative z-10 w-24 h-24 flex items-center justify-center rounded-full bg-teal-50 shadow-lg">
            <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-2xl font-medium mb-6 text-center">Chargement en cours</h2>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
          <div 
            className="bg-teal-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Progress Percentage */}
        <div className="text-gray-600 text-sm">{progress}%</div>
        
        {/* Animated Dots */}
        <div className="flex space-x-2 mt-8">
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-auto pb-6 text-gray-400 text-sm">
        © 2025 Votre Entreprise
      </div>
    </div>
  );
}