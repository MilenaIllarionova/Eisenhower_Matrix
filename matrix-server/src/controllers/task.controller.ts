import { RequestHandler } from 'express';
import { z } from 'zod';
import * as taskService from '../services/task.service';
import { QUADRANTS, STATUSES } from '../models';

const quadrantEnum = z.enum(QUADRANTS as [string, ...string[]]);
const statusEnum = z.enum(STATUSES as [string, ...string[]]);

export const createSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional(),
  quadrant: quadrantEnum,
  status: statusEnum.optional(),
  deadline: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
});

export const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(4000).optional(),
  quadrant: quadrantEnum.optional(),
  status: statusEnum.optional(),
  deadline: z.string().datetime().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
});

export const list: RequestHandler = async (req, res) => {
  const tasks = await taskService.listTasks(req.user!.id, {
    teamId: req.query.teamId as string | undefined,
    projectId: req.query.projectId as string | undefined,
    assigneeId: req.query.assigneeId as string | undefined,
    quadrant: req.query.quadrant as any,
    status: req.query.status as any,
    trashed: req.query.trashed === '1' || req.query.trashed === 'true',
  });
  res.json({ tasks });
};

export const matrix: RequestHandler = async (req, res) => {
  const grouped = await taskService.getMatrix(req.user!.id, {
    teamId: req.query.teamId as string | undefined,
    projectId: req.query.projectId as string | undefined,
  });
  res.json({ matrix: grouped });
};

export const create: RequestHandler = async (req, res) => {
  const task = await taskService.createTask(req.user!.id, req.body);
  res.status(201).json({ task });
};

export const getOne: RequestHandler = async (req, res) => {
  const task = await taskService.getTask(req.user!.id, req.params.id);
  res.json({ task });
};

export const update: RequestHandler = async (req, res) => {
  const task = await taskService.updateTask(req.user!.id, req.params.id, req.body);
  res.json({ task });
};

export const remove: RequestHandler = async (req, res) => {
  const task = await taskService.deleteTask(req.user!.id, req.params.id);
  res.json({ task });
};

export const restore: RequestHandler = async (req, res) => {
  const task = await taskService.restoreTask(req.user!.id, req.params.id);
  res.json({ task });
};

export const purge: RequestHandler = async (req, res) => {
  await taskService.purgeTask(req.user!.id, req.params.id);
  res.status(204).end();
};
