import { api } from './api';
import { User } from '../types';

export const usersApi = {
  search: (q: string) =>
    api.get<{ users: User[] }>('/users/search', { params: { q } }).then((r) => r.data.users),
};
