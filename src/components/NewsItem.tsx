'use client';

import { NewsItem as NewsItemType, SOURCE_CONFIGS } from '@/types/news';
import { formatDistanceToNow } from 'date-fns';

interface NewsItemProps {
  item: NewsItemType;
  rank: number;
}

export default function NewsItem({ item, rank }: NewsItemProps) {
  const sourceConfig = SOURCE_CONFIGS[item.source];
  
  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-gray-900 font-bold';
    if (rank <= 5) return 'text-gray-700 font-semibold';
    return 'text-gray-500';
  };

  const getServiceSymbol = (source: string) => {
    switch (source) {
      case 'hackernews': return 'Y';
      case 'reddit': return 'R';
      case 'lemmy': return 'L';
      case 'mastodon': return 'M';
      case 'medium': return 'Md';
      default: return '?';
    }
  };

  return (
    <article className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="flex-shrink-0 w-8 text-center">
          <span className={`text-lg ${getRankColor(rank)}`}>
            {rank}
          </span>
        </div>

        {/* Service Logo */}
        <div className="flex-shrink-0 w-8 text-center">
          <div className={`w-6 h-6 rounded-full ${sourceConfig.color} flex items-center justify-center mx-auto`}>
            <span className="text-white text-xs font-bold">
              {getServiceSymbol(item.source)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[20px] font-bold text-gray-900 leading-tight flex-1">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
              >
                {item.title}
              </a>
            </h2>
            
            {/* Timestamp - right aligned */}
            <div className="flex-shrink-0">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(item.publishedAt, { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
} 