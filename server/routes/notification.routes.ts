import { notificationService } from '../services/notification.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { jsonResponse, paginatedResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

export async function handleListNotifications(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const url = new URL(req.url);
  const isReadParam = url.searchParams.get('isRead');
  const isRead = isReadParam !== null ? isReadParam === 'true' : undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  try {
    const result = await notificationService.list(auth.user.id, isRead, page, limit);
    return paginatedResponse(result.notifications, result.total, result.page, result.limit);
  } catch (err) {
    return handleRouteError(err, 'List notifications error');
  }
}

export async function handleGetUnreadNotificationCount(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await notificationService.getUnreadCount(auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Get unread notification count error');
  }
}

export async function handleMarkNotificationAsRead(req: Request, notificationId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const updated = await notificationService.markAsRead(notificationId, auth.user.id);
    return jsonResponse(updated, 200);
  } catch (err) {
    return handleRouteError(err, 'Mark notification read error');
  }
}

export async function handleMarkAllNotificationsAsRead(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await notificationService.markAllAsRead(auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Mark all notifications read error');
  }
}

export async function handleDeleteNotification(req: Request, notificationId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await notificationService.delete(notificationId, auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete notification error');
  }
}
