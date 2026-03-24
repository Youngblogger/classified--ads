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
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className={className}>
      <div className="relative">
        <p
          ref={textRef}
          className={`
            text-gray-600 whitespace-pre-wrap break-words
            text-sm md:text-base leading-relaxed md:leading-[1.7]
            transition-all duration-300 ease-out
            ${!isExpanded ? `line-clamp-${maxLines}` : ''}
          `}
        >
          {description}
        </p>
        
        {!isExpanded && showButton && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
        )}
        
        {showButton && (
          <button
            onClick={handleToggle}
            className={`
              relative z-10 mt-2 text-sm font-medium text-primary-600 
              hover:text-primary-700 active:text-primary-800
              transition-colors duration-200
              flex items-center gap-1 ml-auto
              disabled:opacity-50
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded px-1 py-1
            `}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Show more</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
