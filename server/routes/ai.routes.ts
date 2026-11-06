import { z } from 'zod';
import { aiService } from '../services/ai.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { applyRateLimit } from '../middleware/rateLimit.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse, errorResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const chatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(10000),
  systemPrompt: z.string().optional(),
  model: z.string().optional(),
});

export async function handleListConversations(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const conversations = await aiService.listConversations(auth.user.id);
    return jsonResponse(conversations, 200);
  } catch (err) {
    return handleRouteError(err, 'List conversations error');
  }
}

export async function handleGetConversation(req: Request, conversationId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const conv = await aiService.getOrCreateConversation(auth.user.id, conversationId);
    return jsonResponse(conv, 200);
  } catch (err) {
    return handleRouteError(err, 'Get conversation error');
  }
}

export async function handleDeleteConversation(req: Request, conversationId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await aiService.deleteConversation(auth.user.id, conversationId);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete conversation error');
  }
}

export async function handleAIChat(req: Request): Promise<Response> {
  const rateLimitError = applyRateLimit(req, { limit: 30, identifier: 'ai_chat' });
  if (rateLimitError) return rateLimitError;

  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, chatMessageSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await aiService.sendMessage(
      auth.user.id,
      parsed.data.conversationId || '',
      parsed.data.message,
      {
        systemPrompt: parsed.data.systemPrompt,
        model: parsed.data.model,
      }
    );
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'AI chat error');
  }
}

export async function handleAIStream(req: Request): Promise<Response> {
  const rateLimitError = applyRateLimit(req, { limit: 30, identifier: 'ai_stream' });
  if (rateLimitError) return rateLimitError;

  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, chatMessageSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const conv = await aiService.getOrCreateConversation(auth.user.id, parsed.data.conversationId);
    const stream = aiService.streamCompletion(
      [{ role: 'user', content: parsed.data.message }],
      { systemPrompt: parsed.data.systemPrompt, model: parsed.data.model }
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const payload = `data: ${JSON.stringify({ text: chunk, conversationId: conv.id })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamErr) {
          controller.error(streamErr);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return handleRouteError(err, 'AI stream error');
  }
}
