export interface ClientDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  points?: number;
}

export interface EstablishmentDto {
  id?: number;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  valuePerPoint?: number;
}

export interface PurchaseDto {
  purchaseId?: number;
  clientId: number;
  establishmentId: number;
  amount: string;
}

export interface UserAccountDto {
  username: string;
  password: string;
  name: string;
  cpf: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  cep: string;
  email: string;
  birthDate: string;
  permissions: string[];
}
