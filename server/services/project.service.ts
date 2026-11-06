import { prisma } from '../lib/prisma.ts';
import { type Visibility, type ProjectStatus, Prisma } from '@prisma/client';

export interface CreateProjectDTO {
  userId: string;
  name: string;
  description?: string;
  framework?: string;
  visibility?: Visibility;
  status?: ProjectStatus;
  repositoryUrl?: string;
  liveDemoUrl?: string;
  coverImageUrl?: string;
  tags?: string[];
  teamId?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  framework?: string;
  visibility?: Visibility;
  status?: ProjectStatus;
  repositoryUrl?: string;
  liveDemoUrl?: string;
  coverImageUrl?: string;
  tags?: string[];
  qualityScore?: number;
}

export interface ListProjectsFilter {
  userId?: string;
  search?: string;
  framework?: string;
  visibility?: Visibility;
  status?: ProjectStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'starsCount' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class ProjectService {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'project';
  }

  async create(data: CreateProjectDTO) {
    let slug = this.generateSlug(data.name);

    // Ensure unique slug per user
    const existing = await prisma.project.findFirst({
      where: { userId: data.userId, slug },
    });

    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const project = await prisma.project.create({
      data: {
        userId: data.userId,
        teamId: data.teamId,
        name: data.name,
        slug,
        description: data.description,
        framework: data.framework,
        visibility: data.visibility || 'PUBLIC',
        status: data.status || 'ACTIVE',
        repositoryUrl: data.repositoryUrl,
        liveDemoUrl: data.liveDemoUrl,
        coverImageUrl: data.coverImageUrl,
        tags: data.tags || [],
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: 'PROJECT_CREATED',
        entityType: 'project',
        entityId: project.id,
        description: `Created project "${project.name}"`,
      },
    });

    return project;
  }

  async list(filter: ListProjectsFilter) {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.visibility) {
      where.visibility = filter.visibility;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.framework) {
      where.framework = { equals: filter.framework, mode: 'insensitive' };
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {
      [filter.sortBy || 'createdAt']: filter.sortOrder || 'desc',
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { codeReviews: true, documentations: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total, page, limit };
  }

  async getById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        codeReviews: { orderBy: { createdAt: 'desc' }, take: 5 },
        documentations: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async update(id: string, userId: string, data: UpdateProjectDTO) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized to modify this project');

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PROJECT_UPDATED',
        entityType: 'project',
        entityId: id,
        description: `Updated project "${updated.name}"`,
      },
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new Error('Project not found');
    if (project.userId !== userId) throw new Error('Unauthorized to delete this project');

    await prisma.project.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PROJECT_DELETED',
        entityType: 'project',
        entityId: id,
        description: `Deleted project "${project.name}"`,
      },
    });

    return { deleted: true, id };
  }
}

export const projectService = new ProjectService();
