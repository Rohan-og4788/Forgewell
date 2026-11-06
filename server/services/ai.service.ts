import { prisma } from '../lib/prisma.ts';
import { env } from '../config/env.ts';
import { logger } from '../lib/logger.ts';
import { type MessageRole } from '@prisma/client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class AIService {
  /**
   * Create or retrieve an AI Conversation thread
   */
  async getOrCreateConversation(userId: string, conversationId?: string, title?: string) {
    if (conversationId) {
      const conv = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      if (conv && conv.userId === userId) {
        return conv;
      }
    }

    return prisma.aIConversation.create({
      data: {
        userId,
        title: title || 'New AI Assistant Session',
        model: env.AI_PROVIDER === 'mock' ? 'forgewell-native-v1' : 'gpt-4o',
      },
      include: {
        messages: true,
      },
    });
  }

  /**
   * List conversations for a user
   */
  async listConversations(userId: string, limit = 20) {
    return prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { messages: true } },
      },
    });
  }

  /**
   * Delete conversation
   */
  async deleteConversation(userId: string, conversationId: string) {
    const conv = await prisma.aIConversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.userId !== userId) {
      throw new Error('Conversation not found');
    }
    await prisma.aIConversation.delete({ where: { id: conversationId } });
    return { deleted: true, id: conversationId };
  }

  /**
   * Generate AI completion via multi-provider router
   */
  async generateCompletion(
    messages: ChatMessage[],
    options: AICompletionOptions = {}
  ): Promise<{ text: string; tokensUsed: number }> {
    const provider = env.AI_PROVIDER;

    // 1. OpenAI
    if (provider === 'openai' && env.OPENAI_API_KEY) {
      return this.callOpenAI(messages, options);
    }

    // 2. Anthropic
    if (provider === 'anthropic' && env.ANTHROPIC_API_KEY) {
      return this.callAnthropic(messages, options);
    }

    // 3. Gemini
    if (provider === 'gemini' && env.GEMINI_API_KEY) {
      return this.callGemini(messages, options);
    }

    // 4. Groq
    if (provider === 'groq' && env.GROQ_API_KEY) {
      return this.callGroq(messages, options);
    }

    // Default intelligent fallback engine (deterministic contextual generator)
    return this.generateNativeResponse(messages);
  }

  /**
   * Send a message in a conversation and record history & token usage
   */
  async sendMessage(userId: string, conversationId: string, userPrompt: string, options: AICompletionOptions = {}) {
    const conv = await this.getOrCreateConversation(userId, conversationId);

    // Save user message to database
    await prisma.aIMessage.create({
      data: {
        conversationId: conv.id,
        role: 'USER',
        content: userPrompt,
        tokens: Math.ceil(userPrompt.length / 4),
      },
    });

    // Load recent history (last 10 messages)
    const history = await prisma.aIMessage.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const chatMessages: ChatMessage[] = history.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // Generate AI response
    const aiResult = await this.generateCompletion(chatMessages, options);

    // Save assistant message to database
    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conv.id,
        role: 'ASSISTANT',
        content: aiResult.text,
        tokens: aiResult.tokensUsed,
      },
    });

    // Update conversation token usage and touch updatedAt
    await prisma.aIConversation.update({
      where: { id: conv.id },
      data: {
        tokenUsage: { increment: aiResult.tokensUsed + Math.ceil(userPrompt.length / 4) },
      },
    });

    return {
      conversationId: conv.id,
      message: assistantMessage,
      tokensUsed: aiResult.tokensUsed,
    };
  }

  /**
   * Stream response generator for SSE
   */
  async *streamCompletion(messages: ChatMessage[], options: AICompletionOptions = {}) {
    const result = await this.generateCompletion(messages, options);
    const chunks = result.text.match(/.{1,40}/g) || [result.text];

    for (const chunk of chunks) {
      yield chunk;
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }

  // --- Provider Implementations ---

  private async callOpenAI(messages: ChatMessage[], options: AICompletionOptions) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          ...messages,
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error('OpenAI API error', { err });
      throw new Error(`OpenAI API error: ${res.statusText}`);
    }

    const data: any = await res.json();
    return {
      text: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 100,
    };
  }

  private async callAnthropic(messages: ChatMessage[], options: AICompletionOptions) {
    const system = options.systemPrompt || '';
    const anthropicMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-5-sonnet-20241022',
        system,
        messages: anthropicMessages,
        max_tokens: options.maxTokens ?? 2048,
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.statusText}`);
    }

    const data: any = await res.json();
    return {
      text: data.content[0]?.text || '',
      tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  }

  private async callGemini(messages: ChatMessage[], options: AICompletionOptions) {
    const model = options.model || 'gemini-1.5-pro';
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data: any = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      text,
      tokensUsed: data.usageMetadata?.totalTokenCount || Math.ceil(text.length / 4),
    };
  }

  private async callGroq(messages: ChatMessage[], options: AICompletionOptions) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.3-70b-versatile',
        messages,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.statusText}`);
    const data: any = await res.json();
    return {
      text: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens || 100,
    };
  }

  /**
   * Deterministic contextual intelligent assistant for offline/testing/mock mode
   */
  private generateNativeResponse(messages: ChatMessage[]) {
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';

    let text = '';
    if (lastMsg.includes('resume') || lastMsg.includes('bullet')) {
      text = `- Architected and implemented high-throughput asynchronous services, improving query latency by 45%.
- Engineered distributed database optimization strategies, cutting infrastructure cost by 30%.`;
    } else if (lastMsg.includes('optimize') || lastMsg.includes('performance')) {
      text = `Here is an optimized architectural solution:

1. **Memoization & Algorithmic Reduction**: Replace O(n²) iterations with hash map / Set lookups for O(1) retrieval.
2. **Batch Database Queries**: Consolidate multiple individual queries into a single \`findMany\` or batch \`createMany\` to minimize round-trips.
3. **Stream Processing**: Process large payloads with backpressure-enabled Node streams rather than buffering in memory.

\`\`\`typescript
// High-performance constant-time lookup
const indexMap = new Map(items.map(item => [item.id, item]));
const results = targetIds.map(id => indexMap.get(id)).filter(Boolean);
\`\`\``;
    } else if (lastMsg.includes('review') || lastMsg.includes('security') || lastMsg.includes('vulnerability')) {
      text = `### Security & Code Analysis Assessment

- **Timing Attack Mitigation**: Always use \`crypto.timingSafeEqual\` for password or token comparisons.
- **Input Sanitization**: Ensure all external inputs are strictly validated with Zod schemas.
- **SQL Injection Prevention**: Prisma ORM ensures parameterized queries by default. Avoid raw SQL fragments.
- **Rate Limiting**: Apply sliding-window token bucket limits on sensitive endpoints.`;
    } else if (lastMsg.includes('debug') || lastMsg.includes('error')) {
      text = `### Root Cause Analysis & Debugging Steps

1. **Verify Nullability & Types**: Check for undefined dereferencing at runtime.
2. **Inspect Async Boundaries**: Ensure all promises are properly awaited and rejection handlers are attached.
3. **Validate Request Headers**: Verify \`Authorization\` headers, content-types, and CORS preflight responses.`;
    } else {
      text = `Hello! I am your Forgewell AI Developer Assistant. I can assist you with:

- Writing robust TypeScript & backend logic
- Designing scalable PostgreSQL database schemas with Prisma
- Performing automated security and performance code reviews
- Generating production-ready documentation and API specifications

How can I help you build today?`;
    }

    return {
      text,
      tokensUsed: Math.ceil(text.length / 4) + 25,
    };
  }
}

export const aiService = new AIService();
