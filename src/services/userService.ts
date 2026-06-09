import api from './api';
import type { UserAccountDto } from '../types';

export const userService = {
  create: (data: UserAccountDto) => api.post('/users', data),
};
