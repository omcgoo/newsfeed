export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: NewsSource;
  publishedAt: Date;
  score?: number;
  comments?: number;
  author?: string;
  description?: string;
  tags?: string[];
}

export type NewsSource = 
  | 'hackernews'
  | 'reddit'
  | 'lemmy'
  | 'mastodon'
  | 'medium';

export interface NewsSourceConfig {
  name: string;
  color: string;
}

export const SOURCE_CONFIGS: Record<NewsSource, NewsSourceConfig> = {
  hackernews: {
    name: 'Hacker News',
    color: 'bg-orange-500'
  },
  reddit: {
    name: 'Reddit',
    color: 'bg-red-500'
  },
  lemmy: {
    name: 'Lemmy',
    color: 'bg-purple-500'
  },
  mastodon: {
    name: 'Mastodon',
    color: 'bg-indigo-500'
  },
  medium: {
    name: 'Medium',
    color: 'bg-green-500'
  }
}; 