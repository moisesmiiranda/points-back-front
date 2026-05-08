import api from './api';
import type { EstablishmentDto } from '../types';

export const establishmentService = {
  getAll: () => api.get<EstablishmentDto[]>('/establishments/all'),
  getById: (id: number) => api.get<EstablishmentDto>(`/establishments/${id}`),
  create: (data: EstablishmentDto) => api.post('/establishments', data),
  update: (id: number, data: Partial<EstablishmentDto>) =>
    api.put(`/establishments/${id}`, data),
};
