import { Types } from 'mongoose';
import { Project, ProjectMember, ProjectRole, User } from '../models';
import { conflict, forbidden, notFoundError } from '../utils/HttpError';
import { assertMembership } from './team.service';
import { createNotification } from './notification.service';

interface CreateProjectInput {
  name: string;
  description?: string;
  teamId?: string;
  memberInvites?: { userId: string; role: ProjectRole }[];
}

export async function createProject(userId: string, input: CreateProjectInput) {
  if (input.teamId) await assertMembership(input.teamId, userId);

  const project = await Project.create({
    name: input.name,
    description: input.description,
    ownerId: userId,
    teamId: input.teamId,
  });

  // Owner always becomes admin
  await ProjectMember.create({ projectId: project._id, userId, role: 'admin' });

  // Invite extra members with given roles
  if (input.memberInvites?.length) {
    for (const invite of input.memberInvites) {
      if (invite.userId === userId) continue;
      await ProjectMember.updateOne(
        { projectId: project._id, userId: invite.userId },
        { $setOnInsert: { role: invite.role, joinedAt: new Date() } },
        { upsert: true },
      );
      await createNotification({
        userId: invite.userId,
        type: 'project_invited',
        message: `Вас добавили на доску «${project.name}»`,
      });
    }
  }

  return project;
}

export async function listProjects(userId: string, teamId?: string) {
  if (teamId) {
    await assertMembership(teamId, userId);
    return Project.find({ teamId }).sort({ updatedAt: -1 });
  }
  // Return all projects where user is a member (owner included via ProjectMember entry)
  const memberships = await ProjectMember.find({ userId }).select('projectId');
  const ids = memberships.map((m) => m.projectId);
  return Project.find({ _id: { $in: ids } }).sort({ updatedAt: -1 });
}

export async function getProjectMembers(projectId: string, userId: string) {
  await assertProjectMembership(projectId, userId);
  const members = await ProjectMember.find({ projectId }).populate(
    'userId',
    'name email avatarUrl',
  );
  return members;
}

export async function assertProjectMembership(
  projectId: string,
  userId: string,
): Promise<ProjectRole> {
  const member = await ProjectMember.findOne({ projectId, userId });
  if (!member) throw forbidden('Нет доступа к этой доске');
  return member.role;
}

export async function assertProjectAdmin(projectId: string, userId: string) {
  const role = await assertProjectMembership(projectId, userId);
  if (role !== 'admin') throw forbidden('Требуются права администратора доски');
}

export async function addProjectMember(
  projectId: string,
  adminId: string,
  email: string,
  role: ProjectRole = 'member',
) {
  await assertProjectAdmin(projectId, adminId);
  const user = await User.findOne({ email });
  if (!user) throw notFoundError('Пользователь с таким email не зарегистрирован');

  const exists = await ProjectMember.findOne({ projectId, userId: user._id });
  if (exists) throw conflict('Пользователь уже добавлен на доску');

  const member = await ProjectMember.create({
    projectId: new Types.ObjectId(projectId),
    userId: user._id,
    role,
  });

  const project = await Project.findById(projectId);
  await createNotification({
    userId: user.id,
    type: 'project_invited',
    message: `Вас добавили на доску «${project?.name ?? ''}»`,
  });

  return member;
}

/**
 * Удаление доски администратором. Удаляются также все её задачи и связи участников.
 */
export async function deleteProject(userId: string, projectId: string) {
  await assertProjectAdmin(projectId, userId);
  const project = await Project.findById(projectId);
  if (!project) throw notFoundError('Доска не найдена');

  // Удаляем зависимые сущности
  const { Task, ProjectMember } = await import('../models');
  await Task.deleteMany({ projectId: project._id });
  await ProjectMember.deleteMany({ projectId: project._id });
  await project.deleteOne();
}

export async function updateProject(
  userId: string,
  projectId: string,
  patch: { name?: string; description?: string; archivedAt?: Date | null },
) {
  await assertProjectAdmin(projectId, userId);
  const project = await Project.findById(projectId);
  if (!project) throw notFoundError('Доска не найдена');
  if (patch.name !== undefined) project.name = patch.name;
  if (patch.description !== undefined) project.description = patch.description;
  if (patch.archivedAt !== undefined) project.archivedAt = patch.archivedAt ?? undefined;
  await project.save();
  return project;
}
