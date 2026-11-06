import { prisma } from '../lib/prisma.ts';
import { type BlogStatus, Prisma } from '@prisma/client';

export interface CreateBlogDTO {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status?: BlogStatus;
}

export interface ListBlogFilter {
  status?: BlogStatus;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class BlogService {
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'post';
  }

  async create(userId: string, data: CreateBlogDTO) {
    let slug = this.generateSlug(data.title);
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const words = data.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    const blog = await prisma.blog.create({
      data: {
        userId,
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || data.content.slice(0, 150) + '...',
        coverImage: data.coverImage,
        tags: data.tags || [],
        status: data.status || 'DRAFT',
        readTime,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'BLOG_POST_CREATED',
        entityType: 'blog',
        entityId: blog.id,
        description: `Created blog post "${blog.title}"`,
      },
    });

    return blog;
  }

  async list(filter: ListBlogFilter) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.BlogWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.tag) {
      where.tags = { has: filter.tag };
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { content: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, profile: { select: { avatarUrl: true, title: true } } } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    return { posts, total, page, limit };
  }

  async getBySlug(slug: string) {
    const post = await prisma.blog.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, name: true, profile: true } },
      },
    });

    if (!post) {
      throw new Error('Blog post not found');
    }

    await prisma.blog.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  async update(id: string, userId: string, data: Partial<CreateBlogDTO>) {
    const post = await prisma.blog.findUnique({ where: { id } });
    if (!post || post.userId !== userId) {
      throw new Error('Blog post not found');
    }

    let publishedAt = post.publishedAt;
    if (data.status === 'PUBLISHED' && !post.publishedAt) {
      publishedAt = new Date();
    }

    return prisma.blog.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && {
          content: data.content,
          readTime: Math.max(1, Math.ceil(data.content.split(/\s+/).length / 200)),
        }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.tags && { tags: data.tags }),
        ...(data.status && { status: data.status, publishedAt }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const post = await prisma.blog.findUnique({ where: { id } });
    if (!post || post.userId !== userId) {
      throw new Error('Blog post not found');
    }

    await prisma.blog.delete({ where: { id } });
    return { deleted: true, id };
  }
}

export const blogService = new BlogService();
