import { prisma } from '../lib/prisma.ts';
import { env } from '../config/env.ts';
import { encryptToken, decryptToken, generateRandomToken } from '../lib/crypto.ts';
import { logger } from '../lib/logger.ts';

interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
}

export class GitHubService {
  /**
   * Generate GitHub OAuth Authorization URL with state parameter
   */
  getOAuthUrl(userId: string): { url: string; state: string } {
    const state = `${userId}:${generateRandomToken(16)}`;
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: env.GITHUB_CALLBACK_URL,
      scope: 'read:user user:email repo',
      state,
    });

    return {
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
      state,
    };
  }

  /**
   * Handle OAuth Callback: exchange code for token and save integration
   */
  async handleCallback(code: string, state: string) {
    const [userId] = state.split(':');
    if (!userId) {
      throw new Error('Invalid OAuth state parameter');
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.GITHUB_CALLBACK_URL,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Failed to exchange GitHub authorization code');
    }

    const tokenData: any = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'GitHub OAuth failed');
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || null;
    const scope = tokenData.scope || null;

    // Fetch user details from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Forgewell-App',
      },
    });

    if (!userRes.ok) {
      throw new Error('Failed to fetch GitHub profile');
    }

    const ghUser: any = await userRes.json();

    // Encrypt sensitive tokens before database storage
    const encryptedAccessToken = encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null;

    const integration = await prisma.gitHubIntegration.upsert({
      where: { userId },
      create: {
        userId,
        githubUserId: String(ghUser.id),
        githubUsername: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        profileUrl: ghUser.html_url,
        encryptedAccessToken,
        encryptedRefreshToken,
        scope,
        lastSyncedAt: new Date(),
      },
      update: {
        githubUserId: String(ghUser.id),
        githubUsername: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        profileUrl: ghUser.html_url,
        encryptedAccessToken,
        encryptedRefreshToken,
        scope,
        lastSyncedAt: new Date(),
      },
    });

    // Update user profile with GitHub info if empty
    await prisma.userProfile.updateMany({
      where: { userId, githubUsername: null },
      data: {
        githubUsername: ghUser.login,
        avatarUrl: ghUser.avatar_url,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'GITHUB_CONNECTED',
        entityType: 'github',
        description: `Connected GitHub account @${ghUser.login}`,
      },
    });

    return {
      username: ghUser.login,
      avatarUrl: ghUser.avatar_url,
      profileUrl: ghUser.html_url,
      integrationId: integration.id,
    };
  }

  /**
   * Retrieve valid decrypted access token for a user
   */
  private async getDecryptedToken(userId: string): Promise<string> {
    const integration = await prisma.gitHubIntegration.findUnique({ where: { userId } });
    if (!integration) {
      throw new Error('GitHub account is not connected');
    }
    return decryptToken(integration.encryptedAccessToken);
  }

  /**
   * List repositories for the connected user
   */
  async listRepositories(userId: string, page = 1, perPage = 30) {
    const token = await this.getDecryptedToken(userId);

    const res = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=${perPage}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'Forgewell-App',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('GitHub access token expired. Please reconnect your account.');
      }
      throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const repos: GitHubRepoItem[] = (await res.json()) as any;
    return repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      isPrivate: r.private,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
      defaultBranch: r.default_branch,
    }));
  }

  /**
   * Get detailed repository stats, languages, commits
   */
  async getRepositoryDetails(userId: string, owner: string, repo: string) {
    const token = await this.getDecryptedToken(userId);
    const headers = {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Forgewell-App',
    };

    const [repoRes, langRes, commitsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, { headers }),
    ]);

    if (!repoRes.ok) {
      throw new Error(`Repository not found or inaccessible on GitHub`);
    }

    const repoData: any = await repoRes.json();
    const languages: any = langRes.ok ? await langRes.json() : {};
    const commits: any = commitsRes.ok ? await commitsRes.json() : [];

    return {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count,
      defaultBranch: repoData.default_branch,
      language: repoData.language,
      languages,
      recentCommits: commits.slice(0, 10).map((c: any) => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
      })),
    };
  }

  /**
   * Import GitHub repository as a Forgewell project
   */
  async importRepository(userId: string, owner: string, repo: string) {
    const details = await this.getRepositoryDetails(userId, owner, repo);

    // Create project
    let slug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await prisma.project.findFirst({ where: { userId, slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const project = await prisma.project.create({
      data: {
        userId,
        name: details.name,
        slug,
        description: details.description || `Imported from GitHub ${details.fullName}`,
        framework: details.language || 'Unknown',
        repositoryUrl: `https://github.com/${owner}/${repo}`,
        starsCount: details.stars,
        forksCount: details.forks,
        visibility: 'PUBLIC',
        status: 'ACTIVE',
        tags: Object.keys(details.languages as Record<string, unknown>).slice(0, 5),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PROJECT_IMPORTED',
        entityType: 'project',
        entityId: project.id,
        description: `Imported repository "${details.fullName}" from GitHub`,
      },
    });

    return project;
  }

  /**
   * Disconnect GitHub integration
   */
  async disconnect(userId: string) {
    await prisma.gitHubIntegration.deleteMany({ where: { userId } });
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'GITHUB_DISCONNECTED',
        entityType: 'github',
        description: 'Disconnected GitHub account',
      },
    });
    return { disconnected: true };
  }
}

export const githubService = new GitHubService();
