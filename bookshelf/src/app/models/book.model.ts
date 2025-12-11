import { User } from './user.model';

export interface Book {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  genre: string;
  condition: 'novo' | 'excelente' | 'bom' | 'usado';
  owner?: User;
  deliveryLocalPickup: boolean;
  deliveryShipping: boolean;
  available: boolean;
  status?: 'AVAILABLE' | 'RESERVED' | 'SHIPPED' | 'COMPLETED';
  ownerId?: number;
}