import { create } from 'zustand';
import { projectsApi, CreateProjectInput } from '../services/projects';
import { Project } from '../types';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  fetchAll: async () => {
    set({ loading: true });
    try {
      const projects = await projectsApi.list();
      set({ projects, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  createProject: async (input) => {
    const project = await projectsApi.create(input);
    set({ projects: [project, ...get().projects] });
    return project;
  },
  deleteProject: async (id) => {
    await projectsApi.remove(id);
    set({ projects: get().projects.filter((p) => p.id !== id) });
  },
}));
