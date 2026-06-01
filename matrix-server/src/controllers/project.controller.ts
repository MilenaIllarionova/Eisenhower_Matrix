import { RequestHandler } from 'express';
import { z } from 'zod';
import * as projectService from '../services/project.service';
import { PROJECT_ROLES } from '../models';

export const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  teamId: z.string().optional(),
  memberInvites: z
    .array(
      z.object({
        userId: z.string(),
        role: z.enum(PROJECT_ROLES as [string, ...string[]]),
      }),
    )
    .optional(),
});

export const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  archivedAt: z.string().datetime().nullable().optional(),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(PROJECT_ROLES as [string, ...string[]]).default('member'),
});

export const list: RequestHandler = async (req, res) => {
  const projects = await projectService.listProjects(
    req.user!.id,
    req.query.teamId as string | undefined,
  );

  const { Task, ProjectMember } = await import('../models');
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const total = await Task.countDocuments({ projectId: project._id, deletedAt: null });
      const done = await Task.countDocuments({ projectId: project._id, deletedAt: null, status: 'done' });
      const members = await ProjectMember.countDocuments({ projectId: project._id });
      return { ...project.toJSON(), progress: { done, total }, membersCount: members };
    }),
  );

  res.json({ projects: projectsWithStats });
};

export const create: RequestHandler = async (req, res) => {
  const project = await projectService.createProject(req.user!.id, req.body);
  res.status(201).json({ project });
};

export const members: RequestHandler = async (req, res) => {
  const members = await projectService.getProjectMembers(req.params.id, req.user!.id);
  res.json({ members });
};

export const invite: RequestHandler = async (req, res) => {
  const member = await projectService.addProjectMember(
    req.params.id,
    req.user!.id,
    req.body.email,
    req.body.role,
  );
  res.status(201).json({ member });
};

export const remove: RequestHandler = async (req, res) => {
  await projectService.deleteProject(req.user!.id, req.params.id);
  res.status(204).end();
};

export const update: RequestHandler = async (req, res) => {
  const { archivedAt, ...rest } = req.body;
  const project = await projectService.updateProject(req.user!.id, req.params.id, {
    ...rest,
    archivedAt:
      archivedAt === undefined ? undefined : archivedAt === null ? null : new Date(archivedAt),
  });
  res.json({ project });
};
