import React from 'react';

interface ServiceIconProps {
  source: 'hackernews' | 'reddit' | 'bluesky' | 'lemmy' | 'mastodon';
  className?: string;
}

export function ServiceIcon({ source, className = "w-4 h-4" }: ServiceIconProps) {
  switch (source) {
    case 'hackernews':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          {/* Y shape */}
          <path d="M12 2L8 8L12 14L16 8L12 2Z"/>
          <path d="M8 8L8 18L12 22L16 18L16 8"/>
        </svg>
      );
    
    case 'reddit':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          {/* Reddit alien */}
          <circle cx="12" cy="12" r="10"/>
          <circle cx="9" cy="10" r="1.5"/>
          <circle cx="15" cy="10" r="1.5"/>
          <path d="M9 14C9 14 10 16 12 16S15 14 15 14"/>
        </svg>
      );
    
    case 'bluesky':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          {/* Cloud */}
          <path d="M6 14C4.9 14 4 13.1 4 12C4 10.9 4.9 10 6 10C6.1 10 6.2 10 6.3 10.1C6.8 8.4 8.3 7 10 7C11.7 7 13.2 8.4 13.7 10.1C13.8 10 13.9 10 14 10C15.1 10 16 10.9 16 12C16 13.1 15.1 14 14 14H6Z"/>
        </svg>
      );
    
    case 'lemmy':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          {/* L shape */}
          <path d="M6 6H8V16H16V18H6V6Z"/>
        </svg>
      );
    
    case 'mastodon':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          {/* Elephant */}
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22S22 17.52 22 12S17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4S20 7.59 20 12S16.41 20 12 20Z"/>
        </svg>
      );
    
    default:
      return null;
  }
} 