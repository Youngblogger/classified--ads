'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdDescriptionProps {
  description: string;
  className?: string;
  maxLines?: number;
}

export default function AdDescription({ description, className = '', maxLines = 3 }: AdDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight) || 24;
        const maxHeight = lineHeight * maxLines;
        setShowButton(textRef.current.scrollHeight > maxHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [description, maxLines]);

  const handleToggle = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className={className}>
      <div className="relative">
        <p
          ref={textRef}
          className={`
            text-gray-600 whitespace-pre-wrap break-words
            text-xs sm:text-sm md:text-base leading-relaxed md:leading-[1.7]
            transition-all duration-300 ease-out
            ${!isExpanded ? `line-clamp-${maxLines}` : ''}
          `}
        >
          {description}
        </p>
        
        {!isExpanded && showButton && (
          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
        
        {showButton && (
          <button
            onClick={handleToggle}
            className={`
              relative z-10 mt-1 text-xs font-medium text-primary-600 
              hover:text-primary-700 active:scale-95
              transition-all duration-150
              flex items-center gap-0.5 ml-auto
              disabled:opacity-50
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded px-0.5 py-0.5
              ${isPressed ? 'scale-95' : ''}
            `}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span className="text-[10px] sm:text-xs">Show less</span>
                <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200" />
              </>
            ) : (
              <>
                <span className="text-[10px] sm:text-xs">Show more</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
