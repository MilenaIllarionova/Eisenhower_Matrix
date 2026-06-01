import { RequestHandler } from 'express';
import { z } from 'zod';
import * as teamService from '../services/team.service';
import { TEAM_ROLES } from '../models';

export const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
});

export const inviteSchema = z.object({
  email: z.string().email(),
});

export const roleSchema = z.object({
  role: z.enum(TEAM_ROLES as [string, ...string[]]),
});

export const list: RequestHandler = async (req, res) => {
  const teams = await teamService.listUserTeams(req.user!.id);
  res.json({ teams });
};

export const create: RequestHandler = async (req, res) => {
  const team = await teamService.createTeam(req.user!.id, req.body.name, req.body.description);
  res.status(201).json({ team });
};

export const getOne: RequestHandler = async (req, res) => {
  const data = await teamService.getTeamWithMembers(req.params.id, req.user!.id);
  res.json(data);
};

export const invite: RequestHandler = async (req, res) => {
  const member = await teamService.inviteByEmail(req.params.id, req.user!.id, req.body.email);
  res.status(201).json({ member });
};

export const updateMemberRole: RequestHandler = async (req, res) => {
  const member = await teamService.changeRole(req.params.id, req.user!.id, req.params.userId, req.body.role);
  res.json({ member });
};

export const removeMember: RequestHandler = async (req, res) => {
  await teamService.removeMember(req.params.id, req.user!.id, req.params.userId);
  res.status(204).end();
};
