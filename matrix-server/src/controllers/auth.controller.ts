import { RequestHandler } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);
  res.status(201).json(result);
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
};

export const me: RequestHandler = async (req, res) => {
  res.json({ user: req.user });
};
