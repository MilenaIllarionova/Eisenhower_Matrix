import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { unauthorized } from '../utils/HttpError';

interface JwtPayload {
  id: string;
  email: string;
}

export const verifyToken: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('Missing authorization header'));
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
};
