import { supabase } from './supabase';

export interface ContentAnalytics {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'post' | 'article' | 'thread' | 'other';
  platform: string | null;
  title: string | null;
  content_preview: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContentPerformance {
  id: string;
  analytics_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  engagement_rate: number;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContentGenerationStats {
  id: string;
  user_id: string;
  date: string;
  total_generated: number;
  posts_generated: number;
  articles_generated: number;
  threads_generated: number;
  total_words: number;
  expertise_areas_used: string[];
  platforms_targeted: string[];
  created_at: string;
  updated_at: string;
}

export interface ScheduledContentTracking {
  id: string;
  user_id: string;
  content_id: string;
  scheduled_date: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  published_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  totalContent: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagementRate: number;
  contentByPlatform: Record<string, number>;
  contentByType: Record<string, number>;
  topPerformingContent: Array<{
    id: string;
    title: string;
    platform: string;
    views: number;
    engagement_rate: number;
  }>;
  generationStats: {
    totalGenerated: number;
    postsGenerated: number;
    articlesGenerated: number;
    threadsGenerated: number;
    totalWords: number;
    averageWordsPerContent: number;
  };
  scheduledStats: {
    total: number;
    drafts: number;
    scheduled: number;
    published: number;
    failed: number;
  };
  timeSeriesData: Array<{
    date: string;
    contentGenerated: number;
    views: number;
    engagement: number;
  }>;
  expertiseAreaStats: Array<{
    name: string;
    contentCount: number;
    averageEngagement: number;
    totalViews: number;
  }>;
}

/**
 * Record content analytics when content is generated
 */
export async function recordContentGenerated(
  contentId: string,
  contentData: {
    type: 'post' | 'article' | 'thread' | 'other';
    title?: string;
    content: string;
    platform?: string;
    metadata?: Record<string, any>;
  }
): Promise<ContentAnalytics | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('content_analytics')
      .insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentData.type,
        platform: contentData.platform || null,
        title: contentData.title || null,
        content_preview: contentData.content.substring(0, 200),
        metadata: contentData.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    // Update generation stats
    await updateGenerationStats(contentData.type, contentData.content.length);

    return data;
  } catch (error) {
    console.error('Error recording content generated:', error);
    return null;
  }
}

/**
 * Update generation statistics for the current date
 */
async function updateGenerationStats(
  contentType: 'post' | 'article' | 'thread' | 'other',
  wordCount: number
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // Get existing stats for today
    const { data: existing } = await supabase
      .from('content_generation_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const updates: any = {
      total_generated: (existing?.total_generated || 0) + 1,
      total_words: (existing?.total_words || 0) + wordCount
    };

    switch (contentType) {
      case 'post':
        updates.posts_generated = (existing?.posts_generated || 0) + 1;
        break;
      case 'article':
        updates.articles_generated = (existing?.articles_generated || 0) + 1;
        break;
      case 'thread':
        updates.threads_generated = (existing?.threads_generated || 0) + 1;
        break;
    }

    if (existing) {
      await supabase
        .from('content_generation_stats')
        .update(updates)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('content_generation_stats')
        .insert({
          user_id: user.id,
          date: today,
          ...updates
        });
    }
  } catch (error) {
    console.error('Error updating generation stats:', error);
  }
}

/**
 * Record content performance metrics
 */
export async function recordContentPerformance(
  analyticsId: string,
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
  }
): Promise<ContentPerformance | null> {
  try {
    // Get or create performance record
    const { data: existing } = await supabase
      .from('content_performance')
      .select('*')
      .eq('analytics_id', analyticsId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    const updates = {
      views: (existing?.views || 0) + (metrics.views || 0),
      likes: (existing?.likes || 0) + (metrics.likes || 0),
      comments: (existing?.comments || 0) + (metrics.comments || 0),
      shares: (existing?.shares || 0) + (metrics.shares || 0),
      clicks: (existing?.clicks || 0) + (metrics.clicks || 0)
    };

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('content_performance')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('content_performance')
        .insert({
          analytics_id: analyticsId,
          ...updates
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error) {
    console.error('Error recording content performance:', error);
    return null;
  }
}

/**
 * Track scheduled content
 */
export async function trackScheduledContent(
  contentId: string,
  scheduledData: {
    scheduledDate: string;
    platform: string;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    metadata?: Record<string, any>;
  }
): Promise<ScheduledContentTracking | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if already exists
    const { data: existing } = await supabase
      .from('scheduled_content_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_id', contentId)
      .single();

    const data: any = {
      user_id: user.id,
      content_id: contentId,
      scheduled_date: scheduledData.scheduledDate,
      platform: scheduledData.platform,
      status: scheduledData.status,
      metadata: scheduledData.metadata || {}
    };

    if (scheduledData.status === 'published') {
      data.published_at = new Date().toISOString();
    }

    let result;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('scheduled_content_tracking')
        .update(data)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('scheduled_content_tracking')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      result = inserted;
    }

    return result;
  } catch (error) {
    console.error('Error tracking scheduled content:', error);
    return null;
  }
}

/**
 * Get comprehensive analytics data
 */
export async function getAnalyticsData(
  days: number = 30
): Promise<AnalyticsData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get content analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('content_analytics')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (analyticsError) throw analyticsError;

    // Get performance data
    const analyticsIds = analytics?.map(a => a.id) || [];
    const { data: performance, error: perfError } = analyticsIds.length > 0
      ? await supabase
          .from('content_performance')
          .select('*')
          .in('analytics_id', analyticsIds)
      : { data: null, error: null };

    if (perfError) throw perfError;

    // Get generation stats
    const { data: genStats, error: genError } = await supabase
      .from('content_generation_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (genError) throw genError;

    // Get scheduled content
    const { data: scheduled, error: scheduledError } = await supabase
      .from('scheduled_content_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('scheduled_date', startDate.toISOString());

    if (scheduledError) throw scheduledError;

    // Aggregate data
    const totalContent = analytics?.length || 0;
    const totalViews = performance?.reduce((sum, p) => sum + p.views, 0) || 0;
    const totalLikes = performance?.reduce((sum, p) => sum + p.likes, 0) || 0;
    const totalComments = performance?.reduce((sum, p) => sum + p.comments, 0) || 0;
    const totalShares = performance?.reduce((sum, p) => sum + p.shares, 0) || 0;
    const totalEngagement = performance?.reduce((sum, p) => sum + p.engagement_rate, 0) || 0;
    const averageEngagementRate = performance?.length > 0
      ? totalEngagement / performance.length
      : 0;

    // Content by platform
    const contentByPlatform: Record<string, number> = {};
    analytics?.forEach(a => {
      const platform = a.platform || 'Unknown';
      contentByPlatform[platform] = (contentByPlatform[platform] || 0) + 1;
    });

    // Content by type
    const contentByType: Record<string, number> = {};
    analytics?.forEach(a => {
      contentByType[a.content_type] = (contentByType[a.content_type] || 0) + 1;
    });

    // Top performing content
    const performanceMap = new Map(performance?.map(p => [p.analytics_id, p]) || []);
    const topPerformingContent = analytics
      ?.map(a => {
        const perf = performanceMap.get(a.id);
        return {
          id: a.id,
          title: a.title || 'Untitled',
          platform: a.platform || 'Unknown',
          views: perf?.views || 0,
          engagement_rate: perf?.engagement_rate || 0
        };
      })
      .sort((a, b) => b.engagement_rate - a.engagement_rate)
      .slice(0, 10) || [];

    // Generation stats
    const totalGenerated = genStats?.reduce((sum, s) => sum + s.total_generated, 0) || 0;
    const postsGenerated = genStats?.reduce((sum, s) => sum + s.posts_generated, 0) || 0;
    const articlesGenerated = genStats?.reduce((sum, s) => sum + s.articles_generated, 0) || 0;
    const threadsGenerated = genStats?.reduce((sum, s) => sum + s.threads_generated, 0) || 0;
    const totalWords = genStats?.reduce((sum, s) => sum + s.total_words, 0) || 0;
    const averageWordsPerContent = totalGenerated > 0 ? totalWords / totalGenerated : 0;

    // Scheduled stats
    const scheduledStats = {
      total: scheduled?.length || 0,
      drafts: scheduled?.filter(s => s.status === 'draft').length || 0,
      scheduled: scheduled?.filter(s => s.status === 'scheduled').length || 0,
      published: scheduled?.filter(s => s.status === 'published').length || 0,
      failed: scheduled?.filter(s => s.status === 'failed').length || 0
    };

    // Time series data
    const timeSeriesMap = new Map<string, { contentGenerated: number; views: number; engagement: number }>();
    
    // Initialize dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      timeSeriesMap.set(dateStr, { contentGenerated: 0, views: 0, engagement: 0 });
    }

    // Fill with analytics data
    analytics?.forEach(a => {
      const date = new Date(a.created_at).toISOString().split('T')[0];
      const entry = timeSeriesMap.get(date);
      if (entry) {
        entry.contentGenerated++;
      }
    });

    // Fill with performance data
    performance?.forEach(p => {
      const date = new Date(p.recorded_at).toISOString().split('T')[0];
      const entry = timeSeriesMap.get(date);
      if (entry) {
        entry.views += p.views;
        entry.engagement += p.engagement_rate;
      }
    });

    const timeSeriesData = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Expertise area stats (from metadata)
    const expertiseMap = new Map<string, { contentCount: number; totalViews: number; totalEngagement: number }>();
    analytics?.forEach(a => {
      const expertise = a.metadata?.expertiseArea || a.metadata?.expertise_area;
      if (expertise) {
        const perf = performanceMap.get(a.id);
        const existing = expertiseMap.get(expertise) || { contentCount: 0, totalViews: 0, totalEngagement: 0 };
        existing.contentCount++;
        existing.totalViews += perf?.views || 0;
        existing.totalEngagement += perf?.engagement_rate || 0;
        expertiseMap.set(expertise, existing);
      }
    });

    const expertiseAreaStats = Array.from(expertiseMap.entries()).map(([name, data]) => ({
      name,
      contentCount: data.contentCount,
      averageEngagement: data.contentCount > 0 ? data.totalEngagement / data.contentCount : 0,
      totalViews: data.totalViews
    })).sort((a, b) => b.averageEngagement - a.averageEngagement);

    return {
      totalContent,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      averageEngagementRate,
      contentByPlatform,
      contentByType,
      topPerformingContent,
      generationStats: {
        totalGenerated,
        postsGenerated,
        articlesGenerated,
        threadsGenerated,
        totalWords,
        averageWordsPerContent
      },
      scheduledStats,
      timeSeriesData,
      expertiseAreaStats
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return null;
  }
}

