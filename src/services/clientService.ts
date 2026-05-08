import api from './api';
import type { ClientDto } from '../types';

export const clientService = {
  getAll: () => api.get<ClientDto[]>('/clients/all'),
  getById: (id: number) => api.get<ClientDto>(`/clients/${id}`),
  create: (data: ClientDto) => api.post('/clients', data),
  update: (id: number, data: Partial<ClientDto>) => api.put(`/clients/${id}`, data),
  addPoints: (id: number, points: number) =>
    api.put<boolean>(`/clients/${id}/points`, null, { params: { points } }),
};
