import api from './api';
import type { PurchaseDto } from '../types';

export const purchaseService = {
  getAll: () => api.get<PurchaseDto[]>('/purchases'),
  getById: (id: number) => api.get<PurchaseDto>(`/purchases/${id}`),
  create: (data: PurchaseDto) => api.post('/purchases', data),
  update: (id: number, data: Partial<PurchaseDto>) =>
    api.put(`/purchases/${id}`, data),
};
