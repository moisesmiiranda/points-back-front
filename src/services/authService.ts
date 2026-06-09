import api from './api';
import type { UserAccountDto } from '../types';

export const authService = {
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  register: (data: UserAccountDto) => api.post('/auth/register', data),
};
