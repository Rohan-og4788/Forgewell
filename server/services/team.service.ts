import { prisma } from '../lib/prisma.ts';
import { type TeamRole } from '@prisma/client';

export interface CreateTeamDTO {
  name: string;
  slug?: string;
  description?: string;
  avatarUrl?: string;
}

export class TeamService {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'team';
  }

  async create(ownerId: string, data: CreateTeamDTO) {
    let slug = data.slug || this.generateSlug(data.name);
    const existing = await prisma.team.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const team = await prisma.team.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        avatarUrl: data.avatarUrl,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: ownerId,
        action: 'TEAM_CREATED',
        entityType: 'team',
        entityId: team.id,
        description: `Created team "${team.name}"`,
      },
    });

    return team;
  }

  async listUserTeams(userId: string) {
    return prisma.team.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, projects: true } },
      },
    });
  }

  async getById(teamId: string, userId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, profile: true } },
          },
        },
        projects: {
          take: 10,
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!team) throw new Error('Team not found');

    const isMember = team.members.some((m) => m.userId === userId) || team.ownerId === userId;
    if (!isMember) throw new Error('Access denied to this team');

    return team;
  }

  async addMember(teamId: string, requestUserId: string, targetEmail: string, role: TeamRole = 'MEMBER') {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) throw new Error('Team not found');

    const requester = team.members.find((m) => m.userId === requestUserId);
    if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) {
      throw new Error('Only team owners and admins can invite members');
    }

    const targetUser = await prisma.user.findUnique({ where: { email: targetEmail.toLowerCase() } });
    if (!targetUser) {
      throw new Error('User with this email was not found');
    }

    const member = await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUser.id,
        },
      },
      create: {
        teamId,
        userId: targetUser.id,
        role,
      },
      update: {
        role,
      },
    });

    return member;
  }

  async removeMember(teamId: string, requestUserId: string, targetUserId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) throw new Error('Team not found');
    if (team.ownerId === targetUserId) {
      throw new Error('Cannot remove team owner');
    }

    const requester = team.members.find((m) => m.userId === requestUserId);
    if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN' && requestUserId !== targetUserId)) {
      throw new Error('Unauthorized to remove team member');
    }

    await prisma.teamMember.deleteMany({
      where: { teamId, userId: targetUserId },
    });

    return { removed: true, userId: targetUserId };
  }
}

export const teamService = new TeamService();
