import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models';
import { badRequest, conflict, unauthorized } from '../utils/HttpError';

export interface AuthResult {
  token: string;
  user: { id: string; name: string; email: string; avatarUrl?: string };
}

function sign(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  if (password.length < 6) throw badRequest('Password must be at least 6 characters');

  const exists = await User.findOne({ email });
  if (exists) throw conflict('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  return {
    token: sign(user.id, user.email),
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email });
  if (!user) throw unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw unauthorized('Invalid credentials');

  return {
    token: sign(user.id, user.email),
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
  };
}
