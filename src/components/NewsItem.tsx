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
    <>
      <div className="text-center py-3 flex items-center justify-center">
        <span className={`text-lg ${getRankColor(rank)}`}>{rank}</span>
      </div>
      <div className="text-center py-3 flex items-center justify-center">
        <div className={`w-6 h-6 rounded-full ${sourceConfig.color} flex items-center justify-center mx-auto`}>
          <span className="text-white text-xs font-bold">
            {getServiceSymbol(item.source)}
          </span>
        </div>
      </div>
      <div className="py-3 flex items-center">
        <h2 className="text-[20px] font-bold text-gray-900 leading-tight">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors"
          >
            {item.title}
          </a>
        </h2>
      </div>
      <div className="text-right py-3 flex items-center justify-end">
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(item.publishedAt, { addSuffix: true })}
        </span>
      </div>
    </>
  );
} 