import { prisma } from '../lib/prisma.ts';

export class AnalyticsService {
  /**
   * Calculate live analytics and workspace dashboard metrics from actual DB records
   */
  async getUserAnalytics(userId: string) {
    const [
      totalProjects,
      activeProjects,
      codeReviewsCount,
      avgReviewScore,
      docsCount,
      portfoliosCount,
      totalPortfolioViews,
      githubIntegration,
      activityLogs,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.codeReview.count({ where: { userId } }),
      prisma.codeReview.aggregate({
        where: { userId },
        _avg: { score: true },
      }),
      prisma.documentation.count({ where: { userId } }),
      prisma.portfolio.count({ where: { userId } }),
      prisma.portfolio.aggregate({
        where: { userId },
        _sum: { viewCount: true },
      }),
      prisma.gitHubIntegration.findUnique({
        where: { userId },
        select: {
          githubUsername: true,
          avatarUrl: true,
          lastSyncedAt: true,
        },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate weekly productivity trends from recent activity logs
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = await prisma.activityLog.count({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
      },
    });

    const reviewsThisWeek = await prisma.codeReview.count({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
      },
    });

    return {
      overview: {
        totalProjects,
        activeProjects,
        codeReviews: codeReviewsCount,
        averageCodeQualityScore: Math.round(avgReviewScore._avg.score || 0),
        totalDocumentations: docsCount,
        portfoliosCreated: portfoliosCount,
        totalPortfolioViews: totalPortfolioViews._sum.viewCount || 0,
        githubConnected: !!githubIntegration,
        githubUsername: githubIntegration?.githubUsername || null,
      },
      productivity: {
        weeklyActionsCount: weeklyActivities,
        reviewsThisWeek,
        velocityScore: Math.min(100, Math.round(weeklyActivities * 10 + reviewsThisWeek * 15)),
      },
      recentActivities: activityLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        description: log.description,
        timestamp: log.createdAt,
      })),
    };
  }

  /**
   * System-wide overview for admin dashboard
   */
  async getSystemOverview() {
    const [users, projects, reviews, docs, blogs] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.codeReview.count(),
      prisma.documentation.count(),
      prisma.blog.count(),
    ]);

    return {
      totalUsers: users,
      totalProjects: projects,
      totalCodeReviews: reviews,
      totalDocumentations: docs,
      totalBlogPosts: blogs,
    };
  }
}

export const analyticsService = new AnalyticsService();
