import { api } from './api';
import { Project, ProjectMember, ProjectRole } from '../types';

export interface CreateProjectInput {
  name: string;
  description?: string;
  teamId?: string;
  memberInvites?: { userId: string; role: ProjectRole }[];
}

export const projectsApi = {
  list: () => api.get<{ projects: Project[] }>('/projects').then((r) => r.data.projects),
  create: (input: CreateProjectInput) =>
    api.post<{ project: Project }>('/projects', input).then((r) => r.data.project),
  members: (id: string) =>
    api.get<{ members: ProjectMember[] }>(`/projects/${id}/members`).then((r) => r.data.members),
  invite: (id: string, email: string, role: ProjectRole = 'member') =>
    api.post(`/projects/${id}/invite`, { email, role }).then((r) => r.data),
  update: (id: string, patch: Partial<Pick<CreateProjectInput, 'name' | 'description'>>) =>
    api.patch<{ project: Project }>(`/projects/${id}`, patch).then((r) => r.data.project),
  remove: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),
};
