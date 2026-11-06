import { prisma } from '../lib/prisma.ts';
import { aiService } from './ai.service.ts';

export interface ResumeDataDTO {
  title?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
  };
  education?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
  }>;
  experience?: Array<{
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
  }>;
  skills?: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    tools?: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    techStack?: string[];
    link?: string;
  }>;
  isPrimary?: boolean;
}

export class ResumeService {
  async create(userId: string, data: ResumeDataDTO) {
    if (data.isPrimary) {
      await prisma.resume.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: data.title || 'Software Engineer Resume',
        personalInfo: data.personalInfo as any,
        education: (data.education || []) as any,
        experience: (data.experience || []) as any,
        skills: (data.skills || {}) as any,
        certifications: (data.certifications || []) as any,
        projects: (data.projects || []) as any,
        isPrimary: data.isPrimary ?? false,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'RESUME_CREATED',
        entityType: 'resume',
        entityId: resume.id,
        description: `Created resume "${resume.title}"`,
      },
    });

    return resume;
  }

  async list(userId: string) {
    return prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async getById(id: string, userId: string) {
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume || resume.userId !== userId) {
      throw new Error('Resume not found');
    }
    return resume;
  }

  async update(id: string, userId: string, data: Partial<ResumeDataDTO>) {
    const existing = await prisma.resume.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Resume not found');
    }

    if (data.isPrimary) {
      await prisma.resume.updateMany({
        where: { userId, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    return prisma.resume.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.personalInfo && { personalInfo: data.personalInfo as any }),
        ...(data.education && { education: data.education as any }),
        ...(data.experience && { experience: data.experience as any }),
        ...(data.skills && { skills: data.skills as any }),
        ...(data.certifications && { certifications: data.certifications as any }),
        ...(data.projects && { projects: data.projects as any }),
        ...(data.isPrimary !== undefined && { isPrimary: data.isPrimary }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.resume.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Resume not found');
    }

    await prisma.resume.delete({ where: { id } });
    return { deleted: true, id };
  }

  /**
   * AI-powered bullet point & summary enhancement
   */
  async enhanceWithAI(role: string, inputBullets: string[]) {
    const prompt = `As a senior technical recruiter and engineering leader, enhance the following resume bullet points for a ${role}.
Make them impactful, quantified with metrics, starting with strong action verbs (e.g., Architected, Optimized, Engineered).

Original bullets:
${inputBullets.map((b) => `- ${b}`).join('\n')}

Return exactly the same number of enhanced bullet points, one per line starting with "- ".`;

    const aiResult = await aiService.generateCompletion([
      { role: 'system', content: 'You are an executive resume writer for elite software engineers.' },
      { role: 'user', content: prompt },
    ]);

    const lines = aiResult.text
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
      .filter((l) => l.length > 5);

    return {
      enhancedBullets: lines.length > 0 ? lines : inputBullets,
    };
  }

  /**
   * Export resume as formatted printable HTML
   */
  generatePrintableHtml(resume: any): string {
    const p = resume.personalInfo || {};
    const experiences = (resume.experience as any[]) || [];
    const education = (resume.education as any[]) || [];
    const skills = resume.skills || {};

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${p.fullName || 'Resume'} - Forgewell</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { margin-bottom: 4px; font-size: 26px; }
    .contact { font-size: 14px; color: #64748b; margin-bottom: 20px; }
    h2 { font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 24px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    .item { margin-bottom: 16px; }
    .item-header { display: flex; justify-content: space-between; font-weight: bold; }
    .item-subheader { display: flex; justify-content: space-between; font-style: italic; color: #475569; font-size: 14px; }
    ul { margin: 6px 0 0 20px; padding: 0; }
    li { font-size: 14px; margin-bottom: 4px; }
    .skills-section p { font-size: 14px; margin: 4px 0; }
    @media print { body { margin: 0; max-width: 100%; } }
  </style>
</head>
<body>
  <h1>${p.fullName || 'Software Engineer'}</h1>
  <div class="contact">
    ${[p.email, p.phone, p.location, p.website, p.github].filter(Boolean).join(' • ')}
  </div>

  ${p.summary ? `<h2>Professional Summary</h2><p style="font-size: 14px;">${p.summary}</p>` : ''}

  <h2>Experience</h2>
  ${experiences.map((exp: any) => `
    <div class="item">
      <div class="item-header"><span>${exp.company}</span><span>${exp.location || ''}</span></div>
      <div class="item-subheader"><span>${exp.role}</span><span>${exp.startDate} – ${exp.endDate || (exp.current ? 'Present' : '')}</span></div>
      <ul>
        ${(exp.bullets || []).map((b: string) => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('')}

  <h2>Education</h2>
  ${education.map((edu: any) => `
    <div class="item">
      <div class="item-header"><span>${edu.institution}</span><span>${edu.gpa ? `GPA: ${edu.gpa}` : ''}</span></div>
      <div class="item-subheader"><span>${edu.degree} in ${edu.fieldOfStudy}</span><span>${edu.startDate} – ${edu.endDate || ''}</span></div>
    </div>
  `).join('')}

  <h2>Skills</h2>
  <div class="skills-section">
    ${Object.entries(skills).map(([category, items]) => `
      <p><strong>${category.charAt(0).toUpperCase() + category.slice(1)}:</strong> ${Array.isArray(items) ? items.join(', ') : String(items)}</p>
    `).join('')}
  </div>
</body>
</html>`;
  }
}

export const resumeService = new ResumeService();
