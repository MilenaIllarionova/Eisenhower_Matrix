import { Types } from 'mongoose';
import { Team, TeamMember, TeamRole, User } from '../models';
import { conflict, forbidden, notFoundError } from '../utils/HttpError';
import { createNotification } from './notification.service';

export async function createTeam(ownerId: string, name: string, description?: string) {
  const team = await Team.create({ name, description, ownerId });
  await TeamMember.create({ teamId: team._id, userId: ownerId, role: 'admin' });
  return team;
}

export async function listUserTeams(userId: string) {
  const memberships = await TeamMember.find({ userId }).populate('teamId');
  return memberships.map((m) => ({
    role: m.role,
    team: m.teamId,
  }));
}

export async function getTeamWithMembers(teamId: string, userId: string) {
  await assertMembership(teamId, userId);
  const team = await Team.findById(teamId);
  if (!team) throw notFoundError('Team not found');
  const members = await TeamMember.find({ teamId }).populate('userId', 'name email avatarUrl');
  return { team, members };
}

export async function assertMembership(teamId: string, userId: string): Promise<TeamRole> {
  const member = await TeamMember.findOne({ teamId, userId });
  if (!member) throw forbidden('You are not a member of this team');
  return member.role;
}

export async function assertAdmin(teamId: string, userId: string) {
  const role = await assertMembership(teamId, userId);
  if (role !== 'admin') throw forbidden('Admin rights required');
}

export async function inviteByEmail(teamId: string, adminId: string, email: string) {
  await assertAdmin(teamId, adminId);
  const user = await User.findOne({ email });
  if (!user) throw notFoundError('User with this email is not registered');

  const exists = await TeamMember.findOne({ teamId, userId: user._id });
  if (exists) throw conflict('User is already a member of this team');

  const member = await TeamMember.create({
    teamId: new Types.ObjectId(teamId),
    userId: user._id,
    role: 'member',
  });

  await createNotification({
    userId: user.id,
    type: 'team_invited',
    message: `You were added to a team`,
    teamId,
  });

  return member;
}

export async function changeRole(teamId: string, adminId: string, userId: string, role: TeamRole) {
  await assertAdmin(teamId, adminId);
  const member = await TeamMember.findOneAndUpdate({ teamId, userId }, { role }, { new: true });
  if (!member) throw notFoundError('Membership not found');
  return member;
}

export async function removeMember(teamId: string, adminId: string, userId: string) {
  await assertAdmin(teamId, adminId);
  await TeamMember.deleteOne({ teamId, userId });
}
