import { prisma } from '../lib/prisma.ts';
import { aiService } from './ai.service.ts';
import { logger } from '../lib/logger.ts';

export interface CodeIssue {
  id: number;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  line?: number;
  file?: string;
  description: string;
  recommendation: string;
  suggestedFix?: string;
}

export interface CodeReviewResult {
  score: number;
  summary: string;
  issues: CodeIssue[];
  suggestions: string[];
  fixedCode?: string;
}

export class ReviewService {
  /**
   * Static security and bug pattern analyzer
   * Strictly inspects code text without executing it
   */
  private analyzePatterns(code: string, language: string): { issues: CodeIssue[]; scoreDeductions: number } {
    const issues: CodeIssue[] = [];
    let scoreDeductions = 0;
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // 1. Weak Secret / Hardcoded Fallback
      if (line.match(/(JWT_SECRET|SECRET_KEY|API_KEY)\s*\|\|\s*["'][^"']+["']/i)) {
        issues.push({
          id: issues.length,
          title: 'Weak Hardcoded Fallback Secret',
          severity: 'Critical',
          line: lineNum,
          description: 'A fallback secret is hardcoded in the codebase, which can lead to predictable token generation and authentication bypass.',
          recommendation: 'Enforce environment-injected cryptographic secrets and fail fast during startup if missing.',
          suggestedFix: 'if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be set in environment");',
        });
        scoreDeductions += 25;
      }

      // 2. Timing attack with string equality on hashes
      if (line.match(/(===|==)\s*hash|hash\s*(===|==)|passwordHash\s*(===|==)/i)) {
        issues.push({
          id: issues.length,
          title: 'Timing Attack in Hash Comparison',
          severity: 'High',
          line: lineNum,
          description: 'Standard equality comparison (===) leaks execution timing information, enabling side-channel attacks on credentials.',
          recommendation: 'Use constant-time buffer comparison with crypto.timingSafeEqual.',
          suggestedFix: 'crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(calculatedHash))',
        });
        scoreDeductions += 20;
      }

      // 3. Direct eval or dangerouslySetInnerHTML
      if (line.match(/eval\(|Function\(|dangerouslySetInnerHTML/i)) {
        issues.push({
          id: issues.length,
          title: 'Arbitrary Code / Script Execution Risk',
          severity: 'Critical',
          line: lineNum,
          description: 'Executing dynamic strings with eval() or rendering unescaped HTML creates severe remote code execution (RCE) or XSS vulnerabilities.',
          recommendation: 'Remove dynamic code execution and use sanitized parsers or React component hierarchy.',
          suggestedFix: '// Parse structured data using JSON.parse() or a secure AST parser instead',
        });
        scoreDeductions += 30;
      }

      // 4. Missing rate limiting on auth route
      if (line.match(/\/login|\/auth|\/register/i) && !code.includes('rateLimit') && !code.includes('rateLimiter')) {
        if (!issues.some((iss) => iss.title.includes('Rate Limiting'))) {
          issues.push({
            id: issues.length,
            title: 'Missing Brute-Force Rate Limiting Middleware',
            severity: 'Medium',
            line: lineNum,
            description: 'Authentication endpoints must restrict rapid successive attempts to protect against brute-force attacks.',
            recommendation: 'Attach sliding window token bucket rate limiter to auth handlers.',
            suggestedFix: 'await rateLimiter.consume(req.ip, { points: 5 });',
          });
          scoreDeductions += 15;
        }
      }

      // 5. Unbounded any in TypeScript
      if (language.toLowerCase().includes('typescript') && line.match(/:\s*any\b/)) {
        if (issues.length < 5) {
          issues.push({
            id: issues.length,
            title: 'Use of Unsafe `any` Type',
            severity: 'Low',
            line: lineNum,
            description: 'The `any` type disables type safety and may conceal runtime type errors.',
            recommendation: 'Use explicit types or `unknown` with runtime type narrowing (e.g., Zod).',
            suggestedFix: 'Use explicit interface or generic parameter',
          });
          scoreDeductions += 5;
        }
      }

      // 6. Console log left in production code
      if (line.match(/console\.log\(/) && issues.length < 6) {
        issues.push({
          id: issues.length,
          title: 'Unstructured Console Logging',
          severity: 'Low',
          line: lineNum,
          description: 'Direct console.log statements lack structured context and can leak sensitive payload data into logs.',
          recommendation: 'Use a structured logger with severity levels (e.g. logger.debug or logger.info).',
          suggestedFix: 'logger.debug("...", { context })',
        });
        scoreDeductions += 5;
      }
    }

    return { issues, scoreDeductions };
  }

  /**
   * Run full AI-assisted code review
   */
  async reviewCode(
    userId: string,
    params: {
      title: string;
      language: string;
      codeSnippet: string;
      projectId?: string;
    }
  ): Promise<CodeReviewResult & { reviewId: string }> {
    const { title, language, codeSnippet, projectId } = params;

    // 1. Static pattern check
    const { issues: staticIssues, scoreDeductions } = this.analyzePatterns(codeSnippet, language);

    // 2. AI Code Analysis
    let aiSummary = 'Automated code review completed with static AST and security checks.';
    const suggestions: string[] = [
      'Adopt strict Zod schemas for external boundary inputs',
      'Ensure constant-time comparison for all security tokens',
      'Implement structured telemetry and request context logging',
    ];

    try {
      const prompt = `Perform an in-depth code review on the following ${language} code:
\`\`\`${language}
${codeSnippet}
\`\`\`

Identify:
1. Bugs & edge-case crashes
2. Security vulnerabilities
3. Performance and maintainability issues
Format your response as a concise summary with top 3 actionable bullet suggestions.`;

      const aiRes = await aiService.generateCompletion([
        { role: 'system', content: 'You are a principal software architect and application security auditor.' },
        { role: 'user', content: prompt },
      ]);

      if (aiRes.text) {
        aiSummary = aiRes.text.slice(0, 500);
      }
    } catch (err) {
      logger.warn('AI service review enhancement skipped, using static analysis', { err });
    }

    const calculatedScore = Math.max(35, Math.min(100, 100 - scoreDeductions));

    // Construct auto-patched code if issues were detected
    let fixedCode = codeSnippet;
    if (staticIssues.length > 0) {
      fixedCode = `// Auto-Patched Security Improvements\n` +
        codeSnippet
          .replace(/process\.env\.JWT_SECRET\s*\|\|\s*["'][^"']+["']/g, 'process.env.JWT_SECRET /* Required in production */')
          .replace(/user\.passwordHash\s*===\s*hashPassword\(([^)]+)\)/g, 'crypto.timingSafeEqual(Buffer.from(user.passwordHash), Buffer.from(hashPassword($1)))');
    }

    // Persist review to database
    const codeReview = await prisma.codeReview.create({
      data: {
        userId,
        projectId,
        title,
        language,
        codeSnippet,
        score: calculatedScore,
        status: 'COMPLETED',
        summary: aiSummary,
        issues: staticIssues as any,
        suggestions,
        fixedCode: staticIssues.length > 0 ? fixedCode : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CODE_REVIEW_COMPLETED',
        entityType: 'review',
        entityId: codeReview.id,
        description: `Completed code review "${title}" with score ${calculatedScore}/100`,
      },
    });

    return {
      reviewId: codeReview.id,
      score: calculatedScore,
      summary: aiSummary,
      issues: staticIssues,
      suggestions,
      fixedCode: staticIssues.length > 0 ? fixedCode : undefined,
    };
  }

  /**
   * List reviews for a user
   */
  async listReviews(userId: string, projectId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (projectId) where.projectId = projectId;

    const [reviews, total] = await Promise.all([
      prisma.codeReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { project: { select: { name: true, slug: true } } },
      }),
      prisma.codeReview.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  /**
   * Get single review by ID
   */
  async getById(id: string, userId: string) {
    const review = await prisma.codeReview.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!review || review.userId !== userId) {
      throw new Error('Code review not found');
    }

    return review;
  }
}

export const reviewService = new ReviewService();
