import { NewsItem, NewsSource } from '../types/news';

// TypeScript interfaces for API responses
interface HackerNewsItem {
  id: number;
  title: string;
  url: string;
  score: number;
  time: number;
  by: string;
  descendants: number;
}

interface RedditPost {
  data: {
    id: string;
    title: string;
    url: string;
    selftext: string;
    created_utc: number;
    score: number;
    num_comments: number;
    author: string;
    ups: number;
  };
}



interface LemmyPost {
  post: {
    id: number;
    name: string;
    body: string;
    published: string;
  };
  counts: {
    score: number;
    comments: number;
  };
  creator: {
    name: string;
  };
}



interface MastodonPost {
  id: string;
  content: string;
  url: string;
  created_at: string;
  account: {
    username: string;
  };
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
}

interface MediumRSSItem {
  title: string;
  link: string;
  guid?: string;
  pubDate?: string;
  author?: string;
}



interface MediumScrapedPost {
  title: string;
  link: string;
  author: string;
  claps: number;
  index: number;
}

// Cache for storing fetched news items - using localStorage for persistence
// Updated for Vercel deployment
const CACHE_KEY = 'newsfeed_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Function to check if cache is valid
function isCacheValid(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;
    
    const cacheData = JSON.parse(cached);
    const now = Date.now();
    return (now - cacheData.timestamp) < CACHE_DURATION;
  } catch (error) {
    console.log('Cache validation error:', error);
    return false;
  }
}

// Function to get cached items
function getCachedItems(): NewsItem[] | null {
  try {
    if (isCacheValid()) {
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheData = JSON.parse(cached!);
      const cacheAge = Math.round((Date.now() - cacheData.timestamp) / 1000);
      console.log(`Using cached news items (cache age: ${cacheAge} seconds)`);
      return cacheData.items;
    }
    return null;
  } catch (error) {
    console.log('Error reading cache:', error);
    return null;
  }
}

// Function to set cached items
function setCachedItems(items: NewsItem[]): void {
  try {
    const cacheData = {
      items,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('Cached news items for 15 minutes');
  } catch (error) {
    console.log('Error setting cache:', error);
  }
}

// Function to clear cache (useful for debugging or force refresh)
function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Cache cleared');
  } catch (error) {
    console.log('Error clearing cache:', error);
  }
}

// Function to get cache status
function getCacheStatus(): { isValid: boolean; age?: number } {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return { isValid: false };
    
    const cacheData = JSON.parse(cached);
    const now = Date.now();
    const age = Math.round((now - cacheData.timestamp) / 1000);
    const isValid = (now - cacheData.timestamp) < CACHE_DURATION;
    
    return { isValid, age };
  } catch (error) {
    console.log('Error getting cache status:', error);
    return { isValid: false };
  }
}

// Export cache management functions for UI use
export { clearCache, getCacheStatus };

// Advanced Viral Content Detection and Quality Scoring System
// Designed to surface only genuinely important content, avoiding addictive refresh patterns

// Enhanced platform statistics with viral velocity tracking
const PLATFORM_STATS = {
  hackernews: {
    dailyActiveUsers: 500000,
    avgEngagementRate: 0.15,
    weight: 1.2,
    viralThreshold: 100, // Points needed to be considered "viral"
    qualityMultiplier: 1.5, // HN has high signal-to-noise
    velocityWeight: 0.8 // How quickly engagement grows
  },
  reddit: {
    dailyActiveUsers: 50000000,
    avgEngagementRate: 0.08,
    weight: 1.0,
    viralThreshold: 500, // Upvotes needed
    qualityMultiplier: 1.2,
    velocityWeight: 0.6
  },
  lemmy: {
    dailyActiveUsers: 50000,
    avgEngagementRate: 0.25,
    weight: 0.8,
    viralThreshold: 20, // Score needed
    qualityMultiplier: 1.3,
    velocityWeight: 0.7
  },
  mastodon: {
    dailyActiveUsers: 1000000,
    avgEngagementRate: 0.05,
    weight: 0.9,
    viralThreshold: 50, // Combined engagement needed
    qualityMultiplier: 1.1,
    velocityWeight: 0.5
  },
  medium: {
    dailyActiveUsers: 10000000,
    avgEngagementRate: 0.02,
    weight: 1.1,
    viralThreshold: 1000, // Claps needed
    qualityMultiplier: 1.4,
    velocityWeight: 0.9
  }
};

// Viral velocity tracking - how quickly content gains engagement
interface ViralVelocity {
  initialScore: number;
  currentScore: number;
  timeElapsed: number; // hours since first detection
  velocity: number; // score increase per hour
  isViral: boolean;
}

// Enhanced content quality scoring
interface ContentQuality {
  readabilityScore: number; // 0-1, based on title length, clarity
  sourceCredibility: number; // 0-1, based on domain reputation
  engagementQuality: number; // 0-1, ratio of meaningful engagement
  noveltyScore: number; // 0-1, how unique/innovative the content is
  overallQuality: number; // 0-1, weighted average
}

// Persistent cache for viral velocity tracking
const VIRAL_CACHE_KEY = 'viral_velocity_cache';
const VIRAL_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Function to get viral velocity data
function getViralVelocityData(): Record<string, ViralVelocity> {
  try {
    const cached = localStorage.getItem(VIRAL_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      // Only use if cache is fresh
      if (Date.now() - data.timestamp < VIRAL_CACHE_DURATION) {
        return data.velocities || {};
      }
    }
    return {};
  } catch (error) {
    console.log('Error reading viral velocity cache:', error);
    return {};
  }
}

// Function to update viral velocity data
function updateViralVelocityData(velocities: Record<string, ViralVelocity>): void {
  try {
    const cacheData = {
      velocities,
      timestamp: Date.now()
    };
    localStorage.setItem(VIRAL_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.log('Error updating viral velocity cache:', error);
  }
}

// Tech-related keywords for content filtering
const TECH_KEYWORDS = [
  'programming', 'coding', 'developer', 'software', 'tech', 'technology',
  'ai', 'artificial intelligence', 'machine learning', 'ml', 'data science',
  'web', 'webdev', 'frontend', 'backend', 'fullstack', 'react', 'vue', 'angular',
  'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c++', 'c#',
  'database', 'sql', 'nosql', 'docker', 'kubernetes', 'cloud', 'aws', 'azure',
  'git', 'github', 'gitlab', 'open source', 'opensource', 'linux', 'unix',
  'ux', 'ui', 'design', 'user experience', 'user interface', 'accessibility',
  'cybersecurity', 'security', 'privacy', 'blockchain', 'crypto', 'bitcoin',
  'startup', 'entrepreneur', 'product', 'agile', 'scrum', 'devops',
  'mobile', 'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin',
  'api', 'rest', 'graphql', 'microservices', 'architecture', 'system design',
  'testing', 'tdd', 'bdd', 'ci/cd', 'deployment', 'monitoring', 'logging',
  'performance', 'optimization', 'scalability', 'distributed systems'
];

// Tech-related Lemmy communities - balanced selection
const TECH_LEMMY_COMMUNITIES = [
  'programming', 'technology', 'webdev', 'linux', 'opensource', 'selfhosted',
  'privacy', 'cybersecurity', 'ai', 'machinelearning', 'datascience'
];

// Helper function to count English words in text
function englishWordCount(text: string): number {
  const cleanText = text.replace(/<[^>]*>/g, '');
  const words = cleanText.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const commonEnglishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
  return words.filter(word => commonEnglishWords.includes(word)).length;
}

// Function to check if content is within the last 3 days
function isWithin3Days(publishedAt: Date): boolean {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  return publishedAt >= threeDaysAgo;
}

// Helper function to check if content is tech-related
function isTechRelated(title: string, content?: string, community?: string): boolean {
  const text = `${title} ${content || ''} ${community || ''}`.toLowerCase();
  
  // Check for tech keywords
  const hasTechKeyword = TECH_KEYWORDS.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
  
  // Check for tech communities (for Lemmy)
  if (community) {
    const isTechCommunity = TECH_LEMMY_COMMUNITIES.some(techComm => 
      community.toLowerCase().includes(techComm.toLowerCase())
    );
    if (isTechCommunity) return true;
  }
  
  return hasTechKeyword;
}

// Advanced content quality assessment
function assessContentQuality(item: NewsItem, _source: NewsSource): ContentQuality {
  const title = item.title.toLowerCase();
  
  // Readability scoring
  const titleLength = item.title.length;
  const readabilityScore = Math.min(1, titleLength / 100); // Optimal length around 100 chars
  
  // Source credibility based on domain patterns
  const url = item.url.toLowerCase();
  let sourceCredibility = 0.5; // Default neutral
  
  if (url.includes('github.com') || url.includes('stackoverflow.com')) sourceCredibility = 0.9;
  else if (url.includes('medium.com') || url.includes('dev.to')) sourceCredibility = 0.7;
  else if (url.includes('techcrunch.com') || url.includes('arstechnica.com')) sourceCredibility = 0.8;
  else if (url.includes('reddit.com') || url.includes('lemmy.world')) sourceCredibility = 0.4;
  
  // Engagement quality - ratio of meaningful engagement
  const totalEngagement = (item.score || 0) + ((item.comments || 0) * 2);
  const engagementQuality = Math.min(1, totalEngagement / 1000);
  
  // Novelty scoring - detect innovative/unique content
  const noveltyKeywords = ['new', 'breakthrough', 'revolutionary', 'first', 'announcement', 'launch', 'release'];
  const noveltyScore = noveltyKeywords.some(keyword => title.includes(keyword)) ? 0.8 : 0.3;
  
  // Overall quality weighted average
  const overallQuality = (
    readabilityScore * 0.2 +
    sourceCredibility * 0.3 +
    engagementQuality * 0.3 +
    noveltyScore * 0.2
  );
  
  return {
    readabilityScore,
    sourceCredibility,
    engagementQuality,
    noveltyScore,
    overallQuality
  };
}

// Viral velocity calculation
function calculateViralVelocity(item: NewsItem, source: NewsSource): ViralVelocity {
  const viralData = getViralVelocityData();
  const itemKey = `${source}_${item.id}`;
  const now = Date.now();
  
  const currentScore = item.score || 0;
  const timeElapsed = (now - item.publishedAt.getTime()) / (1000 * 60 * 60); // hours
  
  if (viralData[itemKey]) {
    // Update existing viral velocity
    const existing = viralData[itemKey];
    const scoreIncrease = currentScore - existing.initialScore;
    const timeIncrease = timeElapsed - existing.timeElapsed;
    
    const velocity = timeIncrease > 0 ? scoreIncrease / timeIncrease : 0;
    const isViral = currentScore >= PLATFORM_STATS[source].viralThreshold && velocity > 0;
    
    const updatedVelocity: ViralVelocity = {
      initialScore: existing.initialScore,
      currentScore,
      timeElapsed,
      velocity,
      isViral
    };
    
    viralData[itemKey] = updatedVelocity;
    updateViralVelocityData(viralData);
    
    return updatedVelocity;
  } else {
    // First time seeing this item
    const velocity: ViralVelocity = {
      initialScore: currentScore,
      currentScore,
      timeElapsed,
      velocity: 0,
      isViral: currentScore >= PLATFORM_STATS[source].viralThreshold
    };
    
    viralData[itemKey] = velocity;
    updateViralVelocityData(viralData);
    
    return velocity;
  }
}

// Helper function to extract original URL from platform-specific URLs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractOriginalUrl(url: string, source: NewsSource, data: any): string {
  // For Reddit, check if it's a link post
  if (source === 'reddit' && data.url && !data.url.includes('reddit.com')) {
    return data.url; // Return the original URL, not the Reddit post
  }
  
  // For Hacker News, the URL is already the original article
  if (source === 'hackernews') {
    return url;
  }
  
  // For Lemmy, check if it has an external URL
  if (source === 'lemmy' && data.post.url) {
    return data.post.url; // Return the original URL, not the Lemmy post
  }
  
  // For Mastodon, check if it has external links
  if (source === 'mastodon' && data.entities?.urls?.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const externalUrl = data.entities.urls.find((u: any) => 
      !u.url.includes('mastodon.social') && !u.url.includes('mastodon.online')
    );
    if (externalUrl) {
      return externalUrl.url;
    }
  }
  
  // Default: return the platform URL if no external URL found
  return url;
}

// Service-specific engagement calculation functions
function calculateHackerNewsEngagement(item: HackerNewsItem): number {
  // HN uses points (upvotes - downvotes) as primary engagement
  return item.score || 0;
}

function calculateRedditEngagement(item: RedditPost['data']): number {
  // Reddit uses upvotes as primary engagement
  return item.ups || 0;
}

function calculateLemmyEngagement(item: LemmyPost): number {
  // Lemmy uses score (upvotes - downvotes) as primary engagement
  return item.counts?.score || 0;
}

function calculateMastodonEngagement(item: MastodonPost): number {
  // Mastodon engagement calculation: favourites + (reblogs * 2) + replies
  const favourites = item.favourites_count || 0;
  const reblogs = item.reblogs_count || 0;
  const replies = item.replies_count || 0;
  
  const totalEngagement = favourites + (reblogs * 2) + replies;
  
  console.log(`Mastodon engagement calc: favs=${favourites}, reblogs=${reblogs}, replies=${replies}, total=${totalEngagement}`);
  
  // If no engagement, give a reasonable base score for tech posts to ensure representation
  if (totalEngagement === 0) {
    return 50; // Reverted to a more reasonable base score
  }
  
  return totalEngagement;
}



// Advanced unified scoring that prioritizes viral, quality content
function calculateAdvancedScore(item: NewsItem, source: NewsSource): number {
  const platformStats = PLATFORM_STATS[source];
  const quality = assessContentQuality(item, source);
  const viralVelocity = calculateViralVelocity(item, source);
  
  // Base engagement score
  const baseEngagement = item.score || 0;
  
  // Viral velocity bonus (exponential for truly viral content)
  const viralBonus = viralVelocity.isViral ? 
    Math.pow(viralVelocity.velocity * platformStats.velocityWeight, 1.5) : 0;
  
  // Quality multiplier (high quality content gets amplified)
  const qualityMultiplier = 1 + (quality.overallQuality * 0.5);
  
  // Recency decay (but much gentler than traditional algorithms)
  const hoursSincePublished = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60);
  const recencyDecay = Math.max(0.7, 1 - (hoursSincePublished / 168)); // 7 days half-life
  
  // Source credibility bonus
  const credibilityBonus = quality.sourceCredibility * 200;
  
  // Novelty bonus for breakthrough content
  const noveltyBonus = quality.noveltyScore * 300;
  
  // Calculate final score
  const finalScore = (
    (baseEngagement + viralBonus + credibilityBonus + noveltyBonus) * 
    qualityMultiplier * 
    recencyDecay * 
    platformStats.qualityMultiplier
  );
  
  console.log(`Advanced scoring for "${item.title.substring(0, 50)}...":`, {
    source,
    baseEngagement,
    viralBonus: Math.round(viralBonus),
    qualityMultiplier: qualityMultiplier.toFixed(2),
    recencyDecay: recencyDecay.toFixed(2),
    finalScore: Math.round(finalScore)
  });
  
  return Math.round(finalScore);
}

// Intelligent content filtering that only shows genuinely important content
function isSignificantContent(item: NewsItem, source: NewsSource): boolean {
  const platformStats = PLATFORM_STATS[source];
  const quality = assessContentQuality(item, source);
  const viralVelocity = calculateViralVelocity(item, source);
  
  // Must meet minimum viral threshold
  if ((item.score || 0) < platformStats.viralThreshold) return false;
  
  // Must have reasonable quality
  if (quality.overallQuality < 0.4) return false;
  
  // Must be viral OR from highly credible source
  if (!viralVelocity.isViral && quality.sourceCredibility < 0.7) return false;
  
  // Must not be clickbait (title quality check)
  const title = item.title.toLowerCase();
  const clickbaitPatterns = ['you won\'t believe', 'shocking', 'amazing', 'incredible', 'mind-blowing'];
  if (clickbaitPatterns.some(pattern => title.includes(pattern))) return false;
  
  return true;
}

// Function to fetch news from Hacker News API
async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    console.log('Fetching Hacker News...');
    
    // Get top stories (original number)
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = await response.json();
    
    // Fetch details for top 30 stories in parallel
    const storyPromises = storyIds.slice(0, 30).map(async (id: number) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return storyResponse.json();
    });
    
    const stories = await Promise.all(storyPromises);
    
    const posts = stories
              .filter((story: HackerNewsItem) => story && story.title && story.title.length > 10)
        .filter((story: HackerNewsItem) => isTechRelated(story.title))
      .map((story: HackerNewsItem) => {
        return {
          id: `hackernews_${story.id}`,
          title: story.title,
          url: extractOriginalUrl(story.url, 'hackernews', story),
          source: 'hackernews' as NewsSource,
          publishedAt: new Date(story.time * 1000),
          score: calculateHackerNewsEngagement(story),
          comments: story.descendants || 0,
          author: story.by,
          tags: ['Tech', 'Programming', 'AI']
        };
      });
    
    // Filter to only include posts from the last 3 days
    const recentPosts = posts.filter(post => isWithin3Days(post.publishedAt));
    console.log(`Hacker News: ${posts.length} total, ${recentPosts.length} within 3 days`);
    
    return recentPosts;
  } catch (error) {
    console.error('Error fetching Hacker News:', error);
    return [];
  }
}

async function fetchRedditNews(): Promise<NewsItem[]> {
  try {
    console.log('Fetching Reddit news...');
    
    // Original number of subreddits
    const subreddits = ['programming', 'technology', 'webdev', 'reactjs', 'typescript'];
    const allPosts: NewsItem[] = [];
    
    for (const subreddit of subreddits) {
      try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
        const data = await response.json();
        
        const posts = data.data.children
          .filter((post: RedditPost) => post.data.title && post.data.title.length > 10)
          .filter((post: RedditPost) => isTechRelated(post.data.title, post.data.selftext, subreddit))
          .map((post: RedditPost) => {
            return {
              id: `reddit_${post.data.id}`,
              title: post.data.title,
              url: extractOriginalUrl(post.data.url, 'reddit', post.data),
              source: 'reddit' as NewsSource,
              publishedAt: new Date(post.data.created_utc * 1000),
              score: calculateRedditEngagement(post.data),
              comments: post.data.num_comments,
              author: post.data.author,
              tags: ['Tech', 'Programming', 'AI']
            };
          });
        
        allPosts.push(...posts);
      } catch (error) {
        console.error(`Error fetching Reddit subreddit ${subreddit}:`, error);
      }
    }
    
    // Filter to only include posts from the last 3 days
    const recentPosts = allPosts.filter(post => isWithin3Days(post.publishedAt));
    console.log(`Reddit: ${allPosts.length} total, ${recentPosts.length} within 3 days`);
    
    return recentPosts;
  } catch (error) {
    console.error('Error fetching Reddit news:', error);
    return [];
  }
}

// Function to fetch news from Lemmy API - balanced approach
async function fetchLemmyNews(): Promise<NewsItem[]> {
  try {
    // Original number of communities
    const techCommunities = ['programming', 'technology', 'webdev', 'linux', 'opensource'];
    const allPosts: NewsItem[] = [];
    
    for (const community of techCommunities) {
      try {
        const response = await fetch(`https://lemmy.world/api/v3/post/list?community_name=${community}&limit=6&sort=Hot`);
        const data = await response.json();
        
        if (data.posts) {
          const posts = data.posts
            .filter((post: LemmyPost) => post.post.name && post.post.name.length > 10)
            .filter((post: LemmyPost) => isTechRelated(post.post.name, post.post.body, community))
            .map((post: LemmyPost) => {
              const originalUrl = extractOriginalUrl(`https://lemmy.world/post/${post.post.id}`, 'lemmy', post);
              
              return {
                id: `lemmy_${post.post.id}`,
                title: post.post.name,
                url: originalUrl,
                source: 'lemmy' as NewsSource,
                publishedAt: new Date(post.post.published),
                score: calculateLemmyEngagement(post),
                comments: post.counts.comments,
                author: post.creator.name,
                tags: ['Tech', 'Programming', 'AI']
              };
            });
          
          allPosts.push(...posts);
        }
      } catch (error) {
        console.error(`Error fetching Lemmy community ${community}:`, error);
      }
    }
    
    // Filter to only include posts from the last 3 days
    const recentPosts = allPosts.filter((post: NewsItem) => isWithin3Days(post.publishedAt));
    console.log(`Lemmy: ${allPosts.length} total, ${recentPosts.length} within 3 days`);
    
    return recentPosts;
  } catch (error) {
    console.error('Error fetching Lemmy news:', error);
    return [];
  }
}

// Function to fetch news from Mastodon API - focused on tech content
async function fetchMastodonNews(): Promise<NewsItem[]> {
  try {
    console.log('Fetching Mastodon news...');
    
    // Original number of hashtags
    const techHashtags = ['#tech', '#programming', '#ai', '#webdev', '#opensource', '#linux', '#cybersecurity'];
    let allPosts: MastodonPost[] = [];
    
    for (const hashtag of techHashtags.slice(0, 4)) { // Keep original limit
      try {
        console.log(`Fetching Mastodon posts with ${hashtag}...`);
        const response = await fetch(`https://mastodon.social/api/v1/timelines/public?limit=20&tagged=${encodeURIComponent(hashtag)}`);
        const posts = await response.json();
        allPosts = [...allPosts, ...posts];
        console.log(`Found ${posts.length} posts with ${hashtag}`);
      } catch (error) {
        console.log(`Error fetching ${hashtag}:`, error);
      }
    }
    
    // Also get some general trending posts
    try {
      const response = await fetch('https://mastodon.social/api/v1/timelines/public?limit=25');
      const generalPosts = await response.json();
      allPosts = [...allPosts, ...generalPosts];
      console.log(`Found ${generalPosts.length} general posts`);
    } catch (error) {
      console.log('Error fetching general Mastodon posts:', error);
    }
    
    // Remove duplicates and filter
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    
    const filteredPosts = uniquePosts
      .filter((post: MastodonPost) => post.content && post.content.length > 20)
      .filter((post: MastodonPost) => isTechRelated(post.content, post.content))
      .filter((post: MastodonPost) => {
        // English language filtering
        const englishRatio = englishWordCount(post.content) / post.content.split(' ').length;
        return englishRatio > 0.7;
      })
      .map((post: MastodonPost) => {
        const originalUrl = extractOriginalUrl(post.url, 'mastodon', post);
        
        return {
          id: `mastodon_${post.id}`,
          title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
          url: originalUrl,
          source: 'mastodon' as NewsSource,
          publishedAt: new Date(post.created_at),
          score: calculateMastodonEngagement(post),
          comments: 0,
          author: post.account.username,
          tags: ['Tech', 'Programming', 'AI']
        };
      });
    
    // Filter to only include posts from the last 3 days
    const recentPosts = filteredPosts.filter((post: NewsItem) => isWithin3Days(post.publishedAt));
    console.log(`Mastodon: ${filteredPosts.length} total, ${recentPosts.length} within 3 days`);
    
    return recentPosts;
  } catch (error) {
    console.error('Error fetching Mastodon news:', error);
    return [];
  }
}

async function fetchMediumNews(): Promise<NewsItem[]> {
  try {
    console.log('Fetching Medium news from popular tech and UX tags...');
    
    // Scrape the actual Medium tag pages to get the most popular items
    const mediumUrls = [
      'https://medium.com/tag/technology',
      'https://medium.com/tag/ux'
    ];
    
    let allPosts: NewsItem[] = [];
    
    for (const url of mediumUrls) {
      try {
        console.log(`Scraping Medium page: ${url}`);
        
        // Use a CORS proxy to fetch the actual Medium page
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          console.log(`Failed to fetch ${url}: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        const html = data.contents;
        
        // Parse the HTML to extract article information
        // Medium articles are typically in <article> tags with specific classes
        const articleMatches = html.match(/<article[^>]*>([\s\S]*?)<\/article>/g);
        
        if (articleMatches) {
          const posts = articleMatches
            .slice(0, 15) // Original number of articles
            .map((article: string, index: number) => {
              // Extract title
              const titleMatch = article.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/);
              const title = titleMatch ? titleMatch[1].trim() : '';
              
              // Extract link
              const linkMatch = article.match(/href="([^"]*)"[^>]*>/);
              const link = linkMatch ? linkMatch[1] : '';
              
              // Extract author
              const authorMatch = article.match(/@([a-zA-Z0-9_-]+)/);
              const author = authorMatch ? authorMatch[1] : 'Medium Author';
              
              // Extract publication
              const pubMatch = article.match(/medium\.com\/([^\/]+)/);
              const publication = pubMatch ? pubMatch[1] : 'medium';
              
              // Extract engagement (claps) - look for numbers that might be clap counts
              const clapMatch = article.match(/(\d+)\s*(?:claps?|responses?|reads?)/i);
              const claps = clapMatch ? parseInt(clapMatch[1]) : 0;
              
              return {
                title,
                link: link.startsWith('http') ? link : `https://medium.com${link}`,
                author,
                publication,
                claps,
                index
              };
            })
            .filter((post: MediumScrapedPost) => post.title && post.link && post.title.length > 10)
            .filter((post: MediumScrapedPost) => isTechRelated(post.title))
            .map((post: MediumScrapedPost) => {
              // Calculate engagement based on position and claps
              const positionBonus = Math.max(0, 15 - post.index) * 100; // Original calculation
              const clapScore = post.claps * 10;
              const baseScore = 2000;
              
              const engagement = baseScore + positionBonus + clapScore;
              
              return {
                id: `medium_${post.link}`,
                title: post.title,
                url: post.link,
                source: 'medium' as NewsSource,
                publishedAt: new Date(Date.now() - (post.index * 2 * 60 * 60 * 1000)), // Simulate recent posts
                score: engagement,
                comments: 0,
                author: post.author,
                tags: ['Tech', 'Programming', 'AI', 'UX']
              };
            });
          
          allPosts = [...allPosts, ...posts];
          console.log(`Found ${posts.length} popular posts from ${url}`);
        }
      } catch (error) {
        console.log(`Error scraping ${url}:`, error);
      }
    }
    
    // If scraping fails, use a more reliable RSS approach with stable content
    if (allPosts.length === 0) {
      console.log('Scraping failed, using fallback RSS approach...');
      
      // Use a single, reliable RSS feed with more stable content
      const rssUrl = 'https://medium.com/feed/topic/technology';
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=30&api_key=demo`; // Original number
      
      try {
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.items && Array.isArray(data.items)) {
          const posts = data.items
            .slice(0, 20) // Original number
            .filter((item: MediumRSSItem) => item.title && item.title.length > 10)
            .filter((item: MediumRSSItem) => isTechRelated(item.title))
            .map((item: MediumRSSItem, index: number) => {
              // Calculate stable engagement based on position
              const positionScore = Math.max(0, 20 - index) * 150; // Original calculation
              const baseScore = 2000;
              const engagement = baseScore + positionScore;
              
              return {
                id: `medium_${item.guid || item.link}`,
                title: item.title,
                url: item.link,
                source: 'medium' as NewsSource,
                publishedAt: new Date(item.pubDate || Date.now() - (index * 60 * 60 * 1000)),
                score: engagement,
                comments: 0,
                author: item.author || 'Medium Author',
                tags: ['Tech', 'Programming', 'AI']
              };
            });
          
          allPosts = posts;
          console.log(`Found ${posts.length} posts from RSS fallback`);
        }
      } catch (error) {
        console.log('RSS fallback also failed:', error);
      }
    }
    
    // Filter to only include posts from the last 3 days
    const recentPosts = allPosts.filter((post: NewsItem) => isWithin3Days(post.publishedAt));
    console.log(`Medium: ${allPosts.length} total, ${recentPosts.length} within 3 days`);
    
    return recentPosts;
  } catch (error) {
    console.error('Error fetching Medium news:', error);
    return [];
  }
}

// Main function to fetch and aggregate all news with per-capita ranking
export async function fetchNewsItems(): Promise<NewsItem[]> {
  try {
    console.log('Starting to fetch news from all sources...');
    
    // Check cache first
    const cachedItems = getCachedItems();
    if (cachedItems) {
      return cachedItems;
    }

    // Fetch all sources in parallel with reduced limits for faster loading
    const [hackerNewsItems, redditItems, lemmyItems, mastodonItems, mediumItems] = await Promise.all([
      fetchHackerNews(),
      fetchRedditNews(),
      fetchLemmyNews(),
      fetchMastodonNews(),
      fetchMediumNews()
    ]);
    
    console.log('Items fetched from each source:');
    console.log(`- Hacker News: ${hackerNewsItems.length}`);
    console.log(`- Reddit: ${redditItems.length}`);
    console.log(`- Lemmy: ${lemmyItems.length}`);
    console.log(`- Mastodon: ${mastodonItems.length}`);
    console.log(`- Medium: ${mediumItems.length}`);
    
    // Combine all items and filter to recent ones immediately
    const allItems = [...hackerNewsItems, ...redditItems, ...lemmyItems, ...mastodonItems, ...mediumItems];
    console.log(`Total items before filtering: ${allItems.length}`);
    
    // Advanced filtering: only show significant, viral content
    const significantItems = allItems
      .filter((item, index, self) => 
        index === self.findIndex(t => t.url === item.url) && 
        isWithin3Days(item.publishedAt) &&
        isSignificantContent(item, item.source)
      );
    console.log(`Total items after advanced filtering: ${significantItems.length}`);
    
    // Calculate advanced scores and sort by viral quality
    const scoredItems = significantItems
      .map(item => ({
        ...item,
        score: calculateAdvancedScore(item, item.source)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    console.log('Final top 10 items by source:');
    const sourceCounts = scoredItems.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(sourceCounts);
    
    // Cache the final top 10 items
    setCachedItems(scoredItems);
    
    return scoredItems;
  } catch (error) {
    console.error('Error fetching news items:', error);
    return [];
  }
}

// Function to get news from a specific source
export async function fetchNewsFromSource(source: NewsSource): Promise<NewsItem[]> {
  switch (source) {
    case 'hackernews':
      return await fetchHackerNews();
    case 'reddit':
      return await fetchRedditNews();
    case 'lemmy':
      return await fetchLemmyNews();
    case 'mastodon':
      return await fetchMastodonNews();
    case 'medium':
      return await fetchMediumNews();
    default:
      return [];
  }
} 