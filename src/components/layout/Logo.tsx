
"use client";
import React from 'react';

const Logo: React.FC = () => {
  return (
    // Main container:
    // - On small screens (flex-col): KT Erin block appears above Text block.
    // - On md screens and up (md:flex-row): KT Erin block is to the left of Text block.
    // - items-center for vertical alignment on both small and md+ screens.
    <div className="flex flex-col md:flex-row items-center my-8 select-none" data-ai-hint="kids education logo">
      
      {/* K T Erin Block (Image/Icon part - on the left for md screens) */}
      <div className="flex flex-col items-center mb-4 md:mb-0 md:mr-6">
        {/* Row 1.1: K, Smiley, T */}
        <div className="flex items-end space-x-1">
          <div className="flex items-center justify-center w-12 h-12 bg-red-500 text-white text-3xl font-bold rounded-lg transform -rotate-6">
            K
          </div>
          <div className="relative flex items-center justify-center w-12 h-12 bg-orange-400 text-white text-3xl font-bold rounded-lg transform rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-yellow-200">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white text-3xl font-bold rounded-lg transform rotate-6">
            T
          </div>
        </div>
        {/* Row 1.2: Erin (centered below K, Smiley, T) */}
        <div className="text-5xl font-bold text-pink-500 mt-2">
          Erin
        </div>
      </div>

      {/* 全科启蒙 / 0-12岁 (Text part - on the right for md screens) */}
      {/* Added mt-2 here to move the text block down slightly */}
      <div className="flex flex-col items-center text-center mt-2 md:mt-0">
        <div className="text-4xl font-bold text-foreground">
          全科启蒙
        </div>
        <div className="text-lg text-muted-foreground tracking-wider mt-1">
          0-12岁
        </div>
      </div>

    </div>
  );
};

export default Logo;

