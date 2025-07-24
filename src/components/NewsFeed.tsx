'use client';

import { useState, useEffect } from 'react';
import NewsItem from './NewsItem';
import { NewsItem as NewsItemType } from '@/types/news';
import { fetchNewsItems } from '@/lib/newsApi';

export default function NewsFeed() {
  const [newsItems, setNewsItems] = useState<NewsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const items = await fetchNewsItems();
        setNewsItems(items);
      } catch (err) {
        setError('Failed to load news items');
        console.error('Error loading news:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">No stories available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-0">
        {newsItems.map((item, index) => (
          <NewsItem 
            key={item.id} 
            item={item} 
            rank={index + 1} 
          />
        ))}
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          Stories from Hacker News, Reddit, Bluesky, Lemmy, and Mastodon
        </p>
      </div>
    </div>
  );
} 