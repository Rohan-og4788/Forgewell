import { prisma } from '../lib/prisma.ts';

export interface PortfolioDTO {
  title: string;
  slug?: string;
  bio?: string;
  theme?: string;
  sections?: Array<{
    id: string;
    type: 'about' | 'projects' | 'skills' | 'experience' | 'contact';
    title: string;
    content: any;
    order: number;
    visible: boolean;
  }>;
  featuredProjects?: Array<{
    id?: string;
    title: string;
    description: string;
    tags: string[];
    url?: string;
    github?: string;
    stars?: number;
  }>;
  isPublished?: boolean;
  customDomain?: string;
}

export class PortfolioService {
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'portfolio';
  }

  async create(userId: string, data: PortfolioDTO) {
    let slug = data.slug || this.generateSlug(data.title);
    const existing = await prisma.portfolio.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        title: data.title,
        slug,
        bio: data.bio,
        theme: data.theme || 'modern-dark',
        sections: (data.sections || []) as any,
        featuredProjects: (data.featuredProjects || []) as any,
        isPublished: data.isPublished ?? false,
        customDomain: data.customDomain,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PORTFOLIO_CREATED',
        entityType: 'portfolio',
        entityId: portfolio.id,
        description: `Created portfolio "${portfolio.title}"`,
      },
    });

    return portfolio;
  }

  async list(userId: string) {
    return prisma.portfolio.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(id: string, userId: string) {
    const portfolio = await prisma.portfolio.findUnique({ where: { id } });
    if (!portfolio || portfolio.userId !== userId) {
      throw new Error('Portfolio not found');
    }
    return portfolio;
  }

  async getPublicBySlug(slug: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!portfolio || !portfolio.isPublished) {
      throw new Error('Portfolio not found or is private');
    }

    // Increment view count asynchronously
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { viewCount: { increment: 1 } },
    });

    return portfolio;
  }

  async update(id: string, userId: string, data: Partial<PortfolioDTO>) {
    const existing = await prisma.portfolio.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Portfolio not found');
    }

    return prisma.portfolio.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.theme && { theme: data.theme }),
        ...(data.sections && { sections: data.sections as any }),
        ...(data.featuredProjects && { featuredProjects: data.featuredProjects as any }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.customDomain !== undefined && { customDomain: data.customDomain }),
      },
    });
  }

  async setPublishStatus(id: string, userId: string, isPublished: boolean) {
    const existing = await prisma.portfolio.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Portfolio not found');
    }

    const updated = await prisma.portfolio.update({
      where: { id },
      data: { isPublished },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: isPublished ? 'PORTFOLIO_PUBLISHED' : 'PORTFOLIO_UNPUBLISHED',
        entityType: 'portfolio',
        entityId: id,
        description: `${isPublished ? 'Published' : 'Unpublished'} portfolio "${updated.title}"`,
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.portfolio.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Portfolio not found');
    }

    await prisma.portfolio.delete({ where: { id } });
    return { deleted: true, id };
  }
}

export const portfolioService = new PortfolioService();
