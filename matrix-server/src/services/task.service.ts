import { Types } from 'mongoose';
import { Task, Quadrant, TaskStatus, QUADRANTS, STATUSES, Project } from '../models';
import { badRequest, forbidden, notFoundError } from '../utils/HttpError';
import { assertMembership } from './team.service';
import { assertProjectMembership } from './project.service';
import { createNotification } from './notification.service';

interface CreateTaskInput {
  title: string;
  description?: string;
  quadrant: Quadrant;
  status?: TaskStatus;
  deadline?: string;
  assigneeId?: string;
  projectId?: string;
  teamId?: string;
}

export async function createTask(ownerId: string, input: CreateTaskInput) {
  if (!QUADRANTS.includes(input.quadrant)) throw badRequest('Invalid quadrant');
  if (input.status && !STATUSES.includes(input.status)) throw badRequest('Invalid status');

  if (input.teamId) await assertMembership(input.teamId, ownerId);
  if (input.projectId) await assertProjectMembership(input.projectId, ownerId);

  const task = await Task.create({
    title: input.title,
    description: input.description,
    quadrant: input.quadrant,
    status: input.status ?? 'todo',
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    assigneeId: input.assigneeId,
    projectId: input.projectId,
    teamId: input.teamId,
    createdBy: ownerId,
    history: [
      {
        at: new Date(),
        by: new Types.ObjectId(ownerId),
        action: 'created',
        meta: { quadrant: input.quadrant },
      },
    ],
  });

  if (input.assigneeId && input.assigneeId !== ownerId) {
    await createNotification({
      userId: input.assigneeId,
      type: 'task_assigned',
      message: `Вам делегирована задача: ${task.title}`,
      taskId: task.id,
      teamId: input.teamId,
    });
  }

  return task;
}

interface ListFilter {
  teamId?: string;
  projectId?: string;
  assigneeId?: string;
  quadrant?: Quadrant;
  status?: TaskStatus;
  /** Если true — вернуть удалённые/выполненные (корзина). */
  trashed?: boolean;
}

export async function listTasks(userId: string, filter: ListFilter) {
  const query: Record<string, unknown> = {};

  if (filter.projectId) {
    await assertProjectMembership(filter.projectId, userId);
    query.projectId = filter.projectId;
  } else if (filter.teamId) {
    await assertMembership(filter.teamId, userId);
    query.teamId = filter.teamId;
  } else {
    query.$or = [{ createdBy: userId }, { assigneeId: userId }];
  }

  if (filter.assigneeId) query.assigneeId = filter.assigneeId;
  if (filter.quadrant) query.quadrant = filter.quadrant;
  if (filter.status) query.status = filter.status;

  // По умолчанию исключаем soft-deleted задачи
  if (filter.trashed) {
    // Возвращаем выполненные ИЛИ удалённые
    query.$and = [{ $or: [{ status: 'done' }, { deletedAt: { $ne: null } }] }];
  } else {
    query.deletedAt = null;
  }

  return Task.find(query).sort({ updatedAt: -1 }).limit(500);
}

export async function getTask(userId: string, taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) throw notFoundError('Task not found');
  await assertAccess(task, userId);
  return task;
}

async function assertAccess(
  task: {
    teamId?: Types.ObjectId;
    projectId?: Types.ObjectId;
    createdBy: Types.ObjectId;
    assigneeId?: Types.ObjectId;
  },
  userId: string,
) {
  if (task.projectId) return assertProjectMembership(String(task.projectId), userId);
  if (task.teamId) return assertMembership(String(task.teamId), userId);
  if (String(task.createdBy) === userId) return;
  if (task.assigneeId && String(task.assigneeId) === userId) return;
  throw forbidden('Нет доступа к этой задаче');
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  quadrant?: Quadrant;
  status?: TaskStatus;
  deadline?: string | null;
  assigneeId?: string | null;
  projectId?: string | null;
}

export async function updateTask(userId: string, taskId: string, patch: UpdateTaskInput) {
  const task = await Task.findById(taskId);
  if (!task) throw notFoundError('Task not found');
  await assertAccess(task, userId);

  const prevQuadrant = task.quadrant;
  const prevAssignee = task.assigneeId?.toString();
  const prevStatus = task.status;

  if (patch.quadrant !== undefined && String(task.createdBy) !== userId) {
    throw forbidden('Менять квадрант может только владелец задачи');
  }

  if (patch.title !== undefined) task.title = patch.title;
  if (patch.description !== undefined) task.description = patch.description;
  if (patch.quadrant !== undefined) {
    if (!QUADRANTS.includes(patch.quadrant)) throw badRequest('Invalid quadrant');
    task.quadrant = patch.quadrant;
  }
  if (patch.status !== undefined) {
    if (!STATUSES.includes(patch.status)) throw badRequest('Invalid status');
    task.status = patch.status;
  }
  if (patch.deadline !== undefined) task.deadline = patch.deadline ? new Date(patch.deadline) : undefined;
  if (patch.assigneeId !== undefined) task.assigneeId = patch.assigneeId ? new Types.ObjectId(patch.assigneeId) : undefined;
  if (patch.projectId !== undefined) task.projectId = patch.projectId ? new Types.ObjectId(patch.projectId) : undefined;

  task.history.push({
    at: new Date(),
    by: new Types.ObjectId(userId),
    action: 'updated',
    meta: { patch },
  });

  await task.save();

  if (patch.quadrant !== undefined && patch.quadrant !== prevQuadrant && task.assigneeId) {
    await createNotification({
      userId: task.assigneeId.toString(),
      type: 'task_quadrant_changed',
      message: `Задача «${task.title}» перемещена в другой квадрант`,
      taskId: task.id,
      teamId: task.teamId?.toString(),
    });
  }

  if (patch.assigneeId && patch.assigneeId !== prevAssignee) {
    await createNotification({
      userId: patch.assigneeId,
      type: 'task_assigned',
      message: `Вам делегирована задача: ${task.title}`,
      taskId: task.id,
      teamId: task.teamId?.toString(),
    });
  }

  // Workflow: assignee нажал «Выполнено» (review) — уведомить владельца доски
  if (patch.status === 'review' && prevStatus !== 'review') {
    let reviewer: string | undefined;
    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      reviewer = project?.ownerId?.toString();
    } else {
      reviewer = task.createdBy.toString();
    }
    if (reviewer && reviewer !== userId) {
      await createNotification({
        userId: reviewer,
        type: 'task_review_requested',
        message: `Задача «${task.title}» отправлена на проверку`,
        taskId: task.id,
      });
    }
  }

  // Владелец доски подтвердил «done» — уведомить исполнителя
  if (patch.status === 'done' && prevStatus !== 'done' && task.assigneeId) {
    const assigneeStr = task.assigneeId.toString();
    if (assigneeStr !== userId) {
      await createNotification({
        userId: assigneeStr,
        type: 'task_completed',
        message: `Задача «${task.title}» принята`,
        taskId: task.id,
      });
    }
  }

  return task;
}

/** Soft-delete: задача отправляется в корзину (deletedAt = now). */
export async function deleteTask(userId: string, taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) throw notFoundError('Task not found');
  await assertAccess(task, userId);
  task.deletedAt = new Date();
  task.history.push({
    at: new Date(),
    by: new Types.ObjectId(userId),
    action: 'deleted',
  });
  await task.save();
  return task;
}

/** Восстановление из корзины. */
export async function restoreTask(userId: string, taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) throw notFoundError('Task not found');
  await assertAccess(task, userId);
  task.deletedAt = undefined;
  task.history.push({
    at: new Date(),
    by: new Types.ObjectId(userId),
    action: 'restored',
  });
  await task.save();
  return task;
}

/** Полное удаление (только для корзины и только создателем). */
export async function purgeTask(userId: string, taskId: string) {
  const task = await Task.findById(taskId);
  if (!task) throw notFoundError('Task not found');
  if (String(task.createdBy) !== userId) {
    throw forbidden('Полное удаление доступно только владельцу задачи');
  }
  await task.deleteOne();
}

export async function getMatrix(userId: string, filter: { teamId?: string; projectId?: string }) {
  const tasks = await listTasks(userId, filter);
  const grouped: Record<Quadrant, typeof tasks> = {
    urgent_important: [],
    important_not_urgent: [],
    urgent_not_important: [],
    not_urgent_not_important: [],
  };
  for (const task of tasks) grouped[task.quadrant].push(task);
  return grouped;
}
