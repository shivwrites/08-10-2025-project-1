// Content Analytics JavaScript Module
// Compatible with dashboard.html usage

class ContentAnalytics {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  async getAnalyticsData(days = 30) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get content analytics
      const { data: analytics, error: analyticsError } = await this.supabase
        .from('content_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Get performance data
      const analyticsIds = analytics?.map(a => a.id) || [];
      const { data: performance, error: perfError } = analyticsIds.length > 0
        ? await this.supabase
            .from('content_performance')
            .select('*')
            .in('analytics_id', analyticsIds)
        : { data: null, error: null };

      if (perfError) throw perfError;

      // Get generation stats
      const { data: genStats, error: genError } = await this.supabase
        .from('content_generation_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (genError) throw genError;

      // Get scheduled content
      const { data: scheduled, error: scheduledError } = await this.supabase
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
      const contentByPlatform = {};
      analytics?.forEach(a => {
        const platform = a.platform || 'Unknown';
        contentByPlatform[platform] = (contentByPlatform[platform] || 0) + 1;
      });

      // Content by type
      const contentByType = {};
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
            likes: perf?.likes || 0,
            comments: perf?.comments || 0,
            shares: perf?.shares || 0,
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
      const timeSeriesMap = new Map();
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        timeSeriesMap.set(dateStr, { contentGenerated: 0, views: 0, engagement: 0 });
      }

      analytics?.forEach(a => {
        const date = new Date(a.created_at).toISOString().split('T')[0];
        const entry = timeSeriesMap.get(date);
        if (entry) {
          entry.contentGenerated++;
        }
      });

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
      const expertiseMap = new Map();
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
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
  window.ContentAnalytics = ContentAnalytics;
}

