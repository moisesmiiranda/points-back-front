export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface Establishment {
  id?: number;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  valuePerPoint: number;
}

export interface Purchase {
  id?: number;
  clientId: number;
  establishmentId: number;
  amount: number;
  purchaseDate?: string;
  points?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}