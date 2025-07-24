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

// Enhanced platform statistics with platform-aware scoring - REBALANCED
const PLATFORM_STATS = {
  hackernews: {
    dailyActiveUsers: 500000,
    avgEngagementRate: 0.15,
    weight: 1.2, // Reduced from 2.0 to prevent domination
    viralThreshold: 50, // Lower threshold - HN is more selective
    qualityMultiplier: 1.8, // Reduced from 2.0
    velocityWeight: 0.3, // Lower velocity weight - HN is slower, more thoughtful
    postingStyle: 'slow', // Slow, thoughtful posting style
    recencyDecay: 0.95, // Very gentle decay - HN content ages well
    baseScore: 600 // Reduced from 1000 to level the playing field
  },
  reddit: {
    dailyActiveUsers: 50000000,
    avgEngagementRate: 0.08,
    weight: 1.0, // Baseline weight
    viralThreshold: 200, // Reduced from 300 to include more Reddit content
    qualityMultiplier: 1.2,
    velocityWeight: 0.8, // Higher velocity - Reddit is faster
    postingStyle: 'fast', // Fast, high-volume posting
    recencyDecay: 0.85, // Moderate decay
    baseScore: 500
  },
  lemmy: {
    dailyActiveUsers: 50000,
    avgEngagementRate: 0.25,
    weight: 1.3, // Increased from 1.5 to boost representation
    viralThreshold: 10, // Reduced from 15 to include more Lemmy content
    qualityMultiplier: 1.4, // Good quality multiplier
    velocityWeight: 0.6, // Moderate velocity
    postingStyle: 'community', // Community-focused
    recencyDecay: 0.9, // Gentle decay
    baseScore: 700 // Increased from 800 to boost representation
  },
  mastodon: {
    dailyActiveUsers: 1000000,
    avgEngagementRate: 0.05,
    weight: 1.4, // Increased from 1.2 to boost representation
    viralThreshold: 10, // Reduced from 15 to include more Mastodon content
    qualityMultiplier: 1.3, // Good quality multiplier
    velocityWeight: 0.4, // Lower velocity - Mastodon is slower
    postingStyle: 'diverse', // Diverse, slower posting
    recencyDecay: 0.92, // Gentle decay
    baseScore: 800 // Increased from 600 to boost representation
  },
  medium: {
    dailyActiveUsers: 10000000,
    avgEngagementRate: 0.02,
    weight: 1.0, // Increased from 0.8 to boost representation
    viralThreshold: 300, // Reduced from 500 to include more Medium content
    qualityMultiplier: 1.1, // Lower quality multiplier
    velocityWeight: 0.7, // Moderate velocity
    postingStyle: 'commercial', // Commercial, curated content
    recencyDecay: 0.8, // Faster decay - Medium content ages quickly
    baseScore: 600 // Increased from 400 to boost representation
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

// Enhanced tech relevance detection with debugging
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
  
  // Additional tech indicators
  const techIndicators = [
    'github.com', 'stackoverflow.com', 'dev.to', 'medium.com',
    'programming', 'coding', 'developer', 'software', 'tech', 'technology',
    'ai', 'artificial intelligence', 'machine learning', 'data science',
    'web', 'frontend', 'backend', 'fullstack', 'react', 'vue', 'angular',
    'javascript', 'typescript', 'python', 'rust', 'go', 'java', 'c++',
    'database', 'sql', 'nosql', 'docker', 'kubernetes', 'cloud', 'aws', 'azure',
    'git', 'open source', 'opensource', 'linux', 'unix', 'ux', 'ui', 'design',
    'cybersecurity', 'security', 'privacy', 'blockchain', 'crypto',
    'startup', 'entrepreneur', 'product', 'agile', 'scrum', 'devops',
    'mobile', 'ios', 'android', 'flutter', 'react native', 'api', 'rest',
    'graphql', 'microservices', 'architecture', 'system design', 'testing',
    'performance', 'optimization', 'scalability', 'distributed systems',
    // Additional broad tech terms
    'computer', 'digital', 'online', 'internet', 'web', 'app', 'application',
    'code', 'script', 'algorithm', 'data', 'server', 'client', 'network',
    'protocol', 'framework', 'library', 'tool', 'platform', 'service',
    'system', 'hardware', 'software', 'interface', 'user', 'experience',
    'development', 'engineering', 'technical', 'computing', 'automation',
    'integration', 'deployment', 'infrastructure', 'monitoring', 'logging',
    'debugging', 'testing', 'quality', 'maintenance', 'upgrade', 'version',
    'release', 'beta', 'alpha', 'production', 'staging', 'environment'
  ];
  
  const hasTechIndicator = techIndicators.some(indicator => 
    text.includes(indicator.toLowerCase())
  );
  
  const isRelevant = hasTechKeyword || hasTechIndicator;
  
  // Debug logging for Mastodon content
  if (content && content.length > 20) {
    console.log(`Tech relevance check for "${title.substring(0, 50)}...": ${isRelevant} (hasKeyword: ${hasTechKeyword}, hasIndicator: ${hasTechIndicator})`);
  }
  
  return isRelevant;
}

// Advanced content quality assessment
function assessContentQuality(item: NewsItem): ContentQuality {
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

// Viral velocity calculation - fixed for immediate viral detection
function calculateViralVelocity(item: NewsItem, source: NewsSource): ViralVelocity {
  const viralData = getViralVelocityData();
  const itemKey = `${source}_${item.id}`;
  const now = Date.now();
  
  const currentScore = item.score || 0;
  const timeElapsed = Math.max(0.1, (now - item.publishedAt.getTime()) / (1000 * 60 * 60)); // hours, min 0.1
  
  // Check if this item meets viral threshold immediately
  const viralThreshold = PLATFORM_STATS[source].viralThreshold;
  const isViral = currentScore >= viralThreshold;
  
  if (viralData[itemKey]) {
    // Update existing viral velocity
    const existing = viralData[itemKey];
    const scoreIncrease = currentScore - existing.initialScore;
    const timeIncrease = Math.max(0.1, timeElapsed - existing.timeElapsed); // Prevent division by zero
    
    const velocity = scoreIncrease / timeIncrease;
    
    const updatedVelocity: ViralVelocity = {
      initialScore: existing.initialScore,
      currentScore,
      timeElapsed,
      velocity,
      isViral: isViral || velocity > 5 // Viral if threshold met OR moderate velocity
    };
    
    viralData[itemKey] = updatedVelocity;
    updateViralVelocityData(viralData);
    
    console.log(`Viral velocity update for ${source}: score=${currentScore}, velocity=${velocity.toFixed(2)}, isViral=${updatedVelocity.isViral}`);
    
    return updatedVelocity;
  } else {
    // First time seeing this item - calculate initial velocity
    // For new items, assume they gained their current score over the time elapsed
    const initialVelocity = currentScore / timeElapsed;
    
    const velocity: ViralVelocity = {
      initialScore: 0, // Start from 0 for new items
      currentScore,
      timeElapsed,
      velocity: initialVelocity,
      isViral: isViral || initialVelocity > 5 // Viral if threshold met OR high initial velocity
    };
    
    viralData[itemKey] = velocity;
    updateViralVelocityData(viralData);
    
    console.log(`Viral velocity init for ${source}: score=${currentScore}, velocity=${initialVelocity.toFixed(2)}, isViral=${velocity.isViral}`);
    
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
  
  // Enhanced scoring for Mastodon - give higher base scores
  let enhancedScore = totalEngagement;
  
  // Boost for posts with any engagement
  if (totalEngagement > 0) {
    enhancedScore = totalEngagement * 3; // 3x multiplier for any engagement
  } else {
    // Base score for tech-related content
    const content = (item.content || '').toLowerCase();
    const techKeywords = ['programming', 'coding', 'developer', 'tech', 'ai', 'software', 'web', 'linux', 'open source'];
    const hasTechContent = techKeywords.some(keyword => content.includes(keyword));
    
    if (hasTechContent) {
      enhancedScore = 25; // Higher base score for tech content
    } else {
      enhancedScore = 15; // Lower base score for non-tech content
    }
  }
  
  console.log(`Mastodon engagement calc: favs=${favourites}, reblogs=${reblogs}, replies=${replies}, total=${totalEngagement}, enhanced=${enhancedScore}`);
  
  return enhancedScore;
}



// Platform-aware scoring that respects different posting styles
function calculateAdvancedScore(item: NewsItem, source: NewsSource): number {
  const platformStats = PLATFORM_STATS[source];
  const quality = assessContentQuality(item);
  const viralVelocity = calculateViralVelocity(item, source);
  
  // Base engagement score with platform-specific base score
  const baseEngagement = (item.score || 0) + platformStats.baseScore;
  
  // Platform-aware viral velocity bonus
  let viralBonus = 0;
  if (viralVelocity.isViral) {
    // Different viral bonus calculation based on posting style
    const velocityScore = viralVelocity.velocity * platformStats.velocityWeight;
    
    switch (platformStats.postingStyle) {
      case 'slow': // HN - slower, more thoughtful
        viralBonus = Math.pow(velocityScore, 0.8);
        break;
      case 'fast': // Reddit - faster engagement
        viralBonus = Math.pow(velocityScore, 1.2);
        break;
      case 'community': // Lemmy - community-driven
        viralBonus = Math.pow(velocityScore, 1.0);
        break;
      case 'diverse': // Mastodon - diverse content
        viralBonus = Math.pow(velocityScore, 0.9);
        break;
      case 'commercial': // Medium - commercial content
        viralBonus = Math.pow(velocityScore, 1.1);
        break;
      default:
        viralBonus = Math.pow(velocityScore, 1.0);
    }
    
    console.log(`Viral bonus for ${source}: velocity=${viralVelocity.velocity.toFixed(2)}, weight=${platformStats.velocityWeight}, bonus=${viralBonus.toFixed(2)}`);
  }
  
  // Quality multiplier (high quality content gets amplified)
  const qualityMultiplier = 1 + (quality.overallQuality * 0.5);
  
  // Platform-specific recency decay
  const hoursSincePublished = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60);
  const recencyDecay = Math.max(platformStats.recencyDecay, 1 - (hoursSincePublished / 168)); // Platform-specific decay
  
  // Source credibility bonus (higher for slower platforms)
  const credibilityBonus = quality.sourceCredibility * (platformStats.postingStyle === 'slow' ? 400 : 200);
  
  // Novelty bonus for breakthrough content
  const noveltyBonus = quality.noveltyScore * 300;
  
  // Platform weight bonus (HN gets extra weight for thoughtful content)
  const platformWeight = platformStats.weight;
  
  // Calculate final score with platform awareness
  const finalScore = (
    (baseEngagement + viralBonus + credibilityBonus + noveltyBonus) * 
    qualityMultiplier * 
    recencyDecay * 
    platformStats.qualityMultiplier *
    platformWeight
  );
  
  console.log(`Platform-aware scoring for "${item.title.substring(0, 50)}...":`, {
    source,
    postingStyle: platformStats.postingStyle,
    baseEngagement: Math.round(baseEngagement),
    viralBonus: Math.round(viralBonus),
    viralThreshold: platformStats.viralThreshold,
    isViral: viralVelocity.isViral,
    viralVelocity: viralVelocity.velocity.toFixed(2),
    qualityMultiplier: qualityMultiplier.toFixed(2),
    recencyDecay: recencyDecay.toFixed(2),
    platformWeight: platformWeight.toFixed(2),
    finalScore: Math.round(finalScore)
  });
  
  return Math.round(finalScore);
}

// Platform-aware content filtering with debugging and optimization
function isSignificantContent(item: NewsItem, source: NewsSource): boolean {
  const platformStats = PLATFORM_STATS[source];
  const quality = assessContentQuality(item);
  const viralVelocity = calculateViralVelocity(item, source);
  
  // Enhanced tech relevance check
  const isTechRelevant = isTechRelated(item.title, item.title);
  if (!isTechRelevant) {
    console.log(`Filtered out non-tech content: "${item.title.substring(0, 50)}..." (${source})`);
    return false;
  }
  
  // Platform-specific viral thresholds (relaxed for diversity)
  const adjustedThreshold = platformStats.viralThreshold;
  const score = item.score || 0;
  if (score < adjustedThreshold) {
    console.log(`Filtered out low engagement: "${item.title.substring(0, 50)}..." score=${score}, threshold=${adjustedThreshold} (${source})`);
    return false;
  }
  
  // Relaxed quality thresholds for better diversity
  let qualityThreshold = 0.3; // Lowered from 0.4
  switch (platformStats.postingStyle) {
    case 'slow': // HN - already high quality
      qualityThreshold = 0.25;
      break;
    case 'fast': // Reddit - moderate threshold
      qualityThreshold = 0.3;
      break;
    case 'community': // Lemmy - community-driven
      qualityThreshold = 0.25;
      break;
    case 'diverse': // Mastodon - diverse content
      qualityThreshold = 0.2; // Much lower for Mastodon
      break;
    case 'commercial': // Medium - commercial content
      qualityThreshold = 0.4; // Higher for Medium
      break;
  }
  
  if (quality.overallQuality < qualityThreshold) {
    console.log(`Filtered out low quality: "${item.title.substring(0, 50)}..." quality=${quality.overallQuality.toFixed(2)}, threshold=${qualityThreshold} (${source})`);
    return false;
  }
  
  // Relaxed credibility requirements
  let credibilityThreshold = 0.4; // Lowered from 0.7
  if (platformStats.postingStyle === 'slow') {
    credibilityThreshold = 0.3; // HN content is generally credible
  } else if (platformStats.postingStyle === 'commercial') {
    credibilityThreshold = 0.6; // Medium needs higher credibility
  } else if (platformStats.postingStyle === 'diverse') {
    credibilityThreshold = 0.2; // Mastodon is very diverse
  }
  
  // Must be viral OR from credible source (relaxed)
  if (!viralVelocity.isViral && quality.sourceCredibility < credibilityThreshold) {
    console.log(`Filtered out low credibility: "${item.title.substring(0, 50)}..." credibility=${quality.sourceCredibility.toFixed(2)}, threshold=${credibilityThreshold} (${source})`);
    return false;
  }
  
  // Enhanced clickbait detection
  const title = item.title.toLowerCase();
  const clickbaitPatterns = [
    'you won\'t believe', 'shocking', 'amazing', 'incredible', 'mind-blowing',
    'trump', 'biden', 'election', 'politics', 'democrat', 'republican', 'president'
  ];
  if (clickbaitPatterns.some(pattern => title.includes(pattern))) {
    console.log(`Filtered out clickbait/politics: "${item.title.substring(0, 50)}..." (${source})`);
    return false;
  }
  
  console.log(`✅ Accepted: "${item.title.substring(0, 50)}..." (${source}) - score=${score}, quality=${quality.overallQuality.toFixed(2)}, viral=${viralVelocity.isViral}`);
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

// Function to fetch news from Mastodon API - focused on trending content
async function fetchMastodonNews(): Promise<NewsItem[]> {
  try {
    console.log('Fetching Mastodon trending news...');
    
    let allPosts: MastodonPost[] = [];
    
    // Fetch trending posts from Mastodon's explore page
    try {
      console.log('Fetching Mastodon trending posts...');
      const response = await fetch('https://mastodon.social/api/v1/timelines/public?limit=50');
      const posts = await response.json();
      allPosts = [...allPosts, ...posts];
      console.log(`Found ${posts.length} trending posts`);
    } catch (error) {
      console.log('Error fetching Mastodon trending posts:', error);
    }
    
    // Also fetch some tech-specific hashtags for better coverage
    const techHashtags = ['#tech', '#programming', '#ai', '#webdev'];
    for (const hashtag of techHashtags) {
      try {
        console.log(`Fetching Mastodon posts with ${hashtag}...`);
        const response = await fetch(`https://mastodon.social/api/v1/timelines/public?limit=15&tagged=${encodeURIComponent(hashtag)}`);
        const posts = await response.json();
        allPosts = [...allPosts, ...posts];
        console.log(`Found ${posts.length} posts with ${hashtag}`);
      } catch (error) {
        console.log(`Error fetching ${hashtag}:`, error);
      }
    }
    
    // Remove duplicates and filter
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    
    const filteredPosts = uniquePosts
      .filter((post: MastodonPost) => post.content && post.content.length > 20)
      .filter((post: MastodonPost) => {
        const isTech = isTechRelated(post.content, post.content);
        if (!isTech) {
          console.log(`Mastodon tech filter: "${post.content.substring(0, 50)}..." - NOT TECH`);
        }
        return isTech;
      })
      .filter((post: MastodonPost) => {
        // English language filtering - relaxed to allow more content
        const englishRatio = englishWordCount(post.content) / post.content.split(' ').length;
        const isEnglish = englishRatio > 0.3; // Reduced from 0.7 to 0.3
        if (!isEnglish) {
          console.log(`Mastodon language filter: "${post.content.substring(0, 50)}..." - NOT ENGLISH (${englishRatio.toFixed(2)})`);
        }
        return isEnglish;
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
    console.log('Fetching Medium news from RSS feeds...');
    
    // Use a single, reliable RSS feed with a working proxy
    const rssUrl = 'https://medium.com/feed/topic/technology';
    
    // Try a different approach - use a more reliable proxy
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=20&api_key=demo`;
    
    try {
      console.log(`Fetching RSS: ${rssUrl}`);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        console.log(`RSS fetch failed: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      const items = data.items || [];
      
      console.log(`Found ${items.length} items from Medium RSS`);
      
      const allPosts: NewsItem[] = [];
      
      items.forEach((item: Record<string, unknown>, index: number) => {
        const title = (item.title as string) || '';
        const link = (item.link as string) || '';
        const pubDate = (item.pubDate as string) || '';
        const author = (item.author as string) || 'Medium';
        const content = (item.content as string) || '';
        
        if (title && link && isTechRelated(title, content)) {
          // Calculate engagement score based on content length and recency
          const publishedDate = pubDate ? new Date(pubDate) : new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000);
          const hoursSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
          const recencyBonus = Math.max(0, 24 - hoursSincePublished) / 24; // Bonus for recent content
          const contentBonus = Math.min(1, (content.length || 0) / 1000); // Bonus for longer content
          
          const baseScore = 500;
          const engagementScore = Math.floor(baseScore + (recencyBonus * 300) + (contentBonus * 200));
          
          allPosts.push({
            id: `medium_rss_${index}_${Date.now()}`,
            title,
            url: link,
            source: 'medium' as NewsSource,
            publishedAt: publishedDate,
            score: engagementScore,
            comments: 0,
            author,
            tags: ['Tech', 'Programming', 'AI']
          });
        }
      });
      
      // Filter to only include posts from the last 3 days
      const recentPosts = allPosts.filter((post: NewsItem) => isWithin3Days(post.publishedAt));
      console.log(`Medium: ${allPosts.length} total, ${recentPosts.length} within 3 days`);
      
      return recentPosts;
      
    } catch (error) {
      console.log('Medium RSS fetch failed, returning empty array');
      return [];
    }
    
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
    
    // Calculate advanced scores with diversity bonus
    const scoredItems = significantItems
      .map(item => ({
        ...item,
        score: calculateAdvancedScore(item, item.source)
      }))
      .sort((a, b) => b.score - a.score);
    
    // Apply diversity bonus to ensure better source representation
    const diversityBonus = 0.1; // 10% bonus for diverse sources
    const sourceCounts: Record<string, number> = {};
    
    const diversifiedItems = scoredItems.map(item => {
      const currentCount = sourceCounts[item.source] || 0;
      sourceCounts[item.source] = currentCount + 1;
      
      // Apply diversity bonus if this source is underrepresented
      const diversityMultiplier = currentCount === 0 ? (1 + diversityBonus) : 1;
      const finalScore = item.score * diversityMultiplier;
      
      return {
        ...item,
        score: finalScore
      };
    }).sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    console.log('Final top 10 items by source:');
    const finalSourceCounts = diversifiedItems.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(finalSourceCounts);
    
    // Cache the final top 10 items
    setCachedItems(diversifiedItems);
    
    return diversifiedItems;
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