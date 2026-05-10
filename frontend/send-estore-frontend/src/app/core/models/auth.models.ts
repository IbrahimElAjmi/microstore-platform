export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  photoUrl?: string;
  message: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface ProfileDTO {
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
}

export interface ProfileResponse {
  id: number;
  userId: number;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  photoUrl?: string;
}

export enum Role {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}
