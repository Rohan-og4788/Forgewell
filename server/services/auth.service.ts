import { prisma } from '../lib/prisma.ts';
import { getSupabaseClient, getSupabaseAdmin } from '../lib/supabase.ts';
import { hashPassword, verifyPassword } from '../lib/crypto.ts';
import { logger } from '../lib/logger.ts';
import { type Role } from '@prisma/client';
import { env } from '../config/env.ts';

export interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user using Supabase Auth and record in Prisma DB
   */
  async register(data: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    let supabaseUid: string | null = null;

    try {
      // Create user in Supabase Auth
      const supabaseAdmin = getSupabaseAdmin();
      const { data: supaUser, error: supaError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email.toLowerCase(),
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.name },
      });

      if (!supaError && supaUser?.user) {
        supabaseUid = supaUser.user.id;
      } else {
        logger.warn(`Supabase user creation failed: ${supaError?.message}. Falling back to internal auth.`);
      }
    } catch (err) {
      logger.warn('Supabase service unreachable, falling back to local credentials', { err });
    }

    const passwordHash = await hashPassword(data.password);

    // Create User, Profile, Subscription, and initial ActivityLog in Prisma
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name || data.email.split('@')[0],
        passwordHash,
        supabaseUid,
        role: data.role || 'USER',
        isVerified: true,
        profile: {
          create: {
            title: 'Software Developer',
            bio: 'Forgewell developer',
          },
        },
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
          },
        },
        activityLogs: {
          create: {
            action: 'USER_REGISTERED',
            entityType: 'user',
            description: 'User registered account',
          },
        },
      },
      include: {
        profile: true,
        subscription: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        subscription: user.subscription,
      },
    };
  }

  /**
   * Log in user using Supabase Auth or fallback password verification
   */
  async login(data: LoginDTO) {
    const email = data.email.toLowerCase();

    if (
      env.NODE_ENV === 'production' &&
      (email === 'test@forgewell.ai' || email === 'admin@forgewell.ai')
    ) {
      throw new Error('Invalid email or password');
    }

    // 1. Try Supabase Auth first
    try {
      const supabase = getSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (!authError && authData?.session) {
        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { supabaseUid: authData.user.id }],
          },
          include: { profile: true, subscription: true },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              supabaseUid: authData.user.id,
              name: authData.user.user_metadata?.name || email.split('@')[0],
              profile: { create: { title: 'Software Developer' } },
              subscription: { create: { plan: 'FREE', status: 'ACTIVE' } },
            },
            include: { profile: true, subscription: true },
          });
        }

        // Record ActivityLog
        await prisma.activityLog.create({
          data: {
            userId: dbUser.id,
            action: 'USER_LOGIN',
            entityType: 'auth',
            description: 'User logged in via Supabase Auth',
          },
        });

        return {
          token: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            profile: dbUser.profile,
            subscription: dbUser.subscription,
          },
        };
      }
    } catch (err) {
      logger.warn('Supabase auth sign-in failed, trying local DB verification', { err });
    }

    // 2. Fallback: Verify password hash against database
    let dbUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, subscription: true },
    });

    // Auto-provision test account if using standard demo credentials
    if (
      env.NODE_ENV !== 'production' &&
      !dbUser &&
      (email === 'test@forgewell.ai' || email === 'admin@forgewell.ai')
    ) {
      const isTestMatch = (email === 'test@forgewell.ai' && data.password === 'password123') ||
                          (email === 'admin@forgewell.ai' && data.password === 'admin123');
      if (isTestMatch) {
        return this.testLogin(email === 'admin@forgewell.ai' ? 'ADMIN' : 'USER');
      }
    }

    if (!dbUser || !dbUser.passwordHash) {
      throw new Error('Invalid email or password');
    }

    const isValid = await verifyPassword(data.password, dbUser.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Issue local session token
    const token = `usr_${dbUser.id}`;

    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        action: 'USER_LOGIN',
        entityType: 'auth',
        description: 'User logged in via credential authentication',
      },
    });

    return {
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        isVerified: dbUser.isVerified,
        profile: dbUser.profile,
        subscription: dbUser.subscription,
      },
    };
  }

  /**
   * Quick Test / Demo Login
   * Generates or retrieves a pre-configured developer test user
   * with complete workspace data (projects, reviews, activity).
   */
  async testLogin(role: 'USER' | 'ADMIN' = 'USER') {
    if (env.NODE_ENV === 'production') {
      throw new Error('Test login is disabled in production');
    }

    const testEmail = role === 'ADMIN' ? 'admin@forgewell.ai' : 'test@forgewell.ai';
    const testName = role === 'ADMIN' ? 'Forgewell Admin' : 'Demo Developer';
    const password = role === 'ADMIN' ? 'admin123' : 'password123';

    let user = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { profile: true, subscription: true },
    });

    if (!user) {
      const passwordHash = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          email: testEmail,
          name: testName,
          passwordHash,
          role,
          isVerified: true,
          profile: {
            create: {
              title: role === 'ADMIN' ? 'Principal Platform Architect' : 'Senior Full-Stack Engineer',
              bio: 'Testing and demonstration account for Forgewell workspace.',
              company: 'Forgewell Labs',
              location: 'San Francisco, CA',
              skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'React', 'Docker'],
              githubUsername: 'forgewell-tester',
            },
          },
          subscription: {
            create: {
              plan: role === 'ADMIN' ? 'ENTERPRISE' : 'PRO',
              status: 'ACTIVE',
            },
          },
          projects: {
            create: [
              {
                name: 'hyper-vector-engine',
                slug: 'hyper-vector-engine',
                description: 'High-performance vector database indexing engine built in Rust and WebAssembly.',
                framework: 'Rust / WASM',
                visibility: 'PUBLIC',
                status: 'ACTIVE',
                starsCount: 1420,
                forksCount: 128,
                qualityScore: 98,
                tags: ['Rust', 'WASM', 'Vectors', 'AI'],
              },
              {
                name: 'synapse-copilot-ui',
                slug: 'synapse-copilot-ui',
                description: 'Next-generation AI code companion UI with streaming syntax highlighting.',
                framework: 'Next.js 15',
                visibility: 'PUBLIC',
                status: 'ACTIVE',
                starsCount: 840,
                forksCount: 64,
                qualityScore: 94,
                tags: ['Next.js', 'TypeScript', 'Tailwind', 'AI'],
              },
            ],
          },
          notifications: {
            create: [
              {
                title: 'Welcome to Forgewell',
                message: 'Your testing account has been initialized with sample projects and metrics.',
                type: 'SYSTEM',
              },
            ],
          },
          activityLogs: {
            create: [
              {
                action: 'TEST_LOGIN_INITIALIZED',
                entityType: 'auth',
                description: `Test login session initiated for ${testEmail}`,
              },
            ],
          },
        },
        include: { profile: true, subscription: true },
      });
    }

    const token = `usr_${user.id}`;

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'TEST_LOGIN',
        entityType: 'auth',
        description: `Logged in via test login (${role})`,
      },
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        subscription: user.subscription,
      },
    };
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Return success to avoid email enumeration
      return { sent: true };
    }

    try {
      const supabase = getSupabaseClient();
      await supabase.auth.resetPasswordForEmail(email.toLowerCase());
    } catch (err) {
      logger.warn('Password reset via Supabase failed', { err });
    }

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entityType: 'auth',
        description: 'Password reset email requested',
      },
    });

    return { sent: true };
  }

  /**
   * Reset password with token/new password
   */
  async updatePassword(userId: string, newPassword: string) {
    const passwordHash = await hashPassword(newPassword);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    if (user.supabaseUid) {
      try {
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin.auth.admin.updateUserById(user.supabaseUid, {
          password: newPassword,
        });
      } catch (err) {
        logger.warn('Updating password in Supabase failed', { err });
      }
    }

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PASSWORD_UPDATED',
        entityType: 'auth',
        description: 'Password successfully updated',
      },
    });

    return { updated: true };
  }

  /**
   * Get authenticated user profile & preferences
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscription: true,
        github: {
          select: {
            githubUsername: true,
            avatarUrl: true,
            profileUrl: true,
            lastSyncedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      profile: user.profile,
      subscription: user.subscription,
      githubConnected: !!user.github,
      github: user.github,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
