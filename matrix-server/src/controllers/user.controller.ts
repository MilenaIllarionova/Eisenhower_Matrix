import { RequestHandler } from 'express';
import { User } from '../models';

export const search: RequestHandler = async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) return res.json({ users: [] });
  const users = await User.find({
    $or: [
      { email: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
    ],
  })
    .limit(20)
    .select('name email avatarUrl');
  return res.json({ users });
};
