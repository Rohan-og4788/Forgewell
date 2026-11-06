import { z } from 'zod';
import { resumeService } from '../services/resume.service.ts';
import { authenticateRequest } from '../middleware/auth.ts';
import { parseJsonBody } from '../middleware/validate.ts';
import { jsonResponse } from '../lib/response.ts';
import { handleRouteError } from '../middleware/errorHandler.ts';

const resumeSchema = z.object({
  title: z.string().optional(),
  personalInfo: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    summary: z.string().optional(),
  }),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        fieldOfStudy: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        gpa: z.string().optional(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        location: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        bullets: z.array(z.string()),
      })
    )
    .optional(),
  skills: z
    .object({
      languages: z.array(z.string()).optional(),
      frameworks: z.array(z.string()).optional(),
      databases: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
    })
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        issueDate: z.string().optional(),
      })
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        techStack: z.array(z.string()).optional(),
        link: z.string().optional(),
      })
    )
    .optional(),
  isPrimary: z.boolean().optional(),
});

const enhanceSchema = z.object({
  role: z.string().min(1, 'Target role is required'),
  bullets: z.array(z.string()).min(1, 'At least one bullet is required'),
});

export async function handleListResumes(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const resumes = await resumeService.list(auth.user.id);
    return jsonResponse(resumes, 200);
  } catch (err) {
    return handleRouteError(err, 'List resumes error');
  }
}

export async function handleCreateResume(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, resumeSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const resume = await resumeService.create(auth.user.id, parsed.data);
    return jsonResponse(resume, 201);
  } catch (err) {
    return handleRouteError(err, 'Create resume error');
  }
}

export async function handleGetResumeById(req: Request, resumeId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const resume = await resumeService.getById(resumeId, auth.user.id);
    return jsonResponse(resume, 200);
  } catch (err) {
    return handleRouteError(err, 'Get resume error');
  }
}

export async function handleUpdateResume(req: Request, resumeId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, resumeSchema.partial());
  if ('response' in parsed) return parsed.response;

  try {
    const updated = await resumeService.update(resumeId, auth.user.id, parsed.data);
    return jsonResponse(updated, 200);
  } catch (err) {
    return handleRouteError(err, 'Update resume error');
  }
}

export async function handleDeleteResume(req: Request, resumeId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const result = await resumeService.delete(resumeId, auth.user.id);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Delete resume error');
  }
}

export async function handleEnhanceResumeBullets(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  const parsed = await parseJsonBody(req, enhanceSchema);
  if ('response' in parsed) return parsed.response;

  try {
    const result = await resumeService.enhanceWithAI(parsed.data.role, parsed.data.bullets);
    return jsonResponse(result, 200);
  } catch (err) {
    return handleRouteError(err, 'Enhance resume bullets error');
  }
}

export async function handleExportResumeHtml(req: Request, resumeId: string): Promise<Response> {
  const auth = await authenticateRequest(req);
  if ('response' in auth) return auth.response;

  try {
    const resume = await resumeService.getById(resumeId, auth.user.id);
    const html = resumeService.generatePrintableHtml(resume);
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="resume-${resume.title}.html"`,
      },
    });
  } catch (err) {
    return handleRouteError(err, 'Export resume error');
  }
}
