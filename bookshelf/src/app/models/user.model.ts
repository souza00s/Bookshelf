import { Book } from './book.model';

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  description?: string;
  pixKey?: string | null;
  // New multi-key support (list of PIX keys returned by backend UserDetailDTO)
  pixKeys?: string[];
  favoriteGenres?: string[];
  addresses?: Address[];
  books?: Book[];
  password?: string;
}

export interface Address {
  id?: number;
  label?: string;
  cep: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
}