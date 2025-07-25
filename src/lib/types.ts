
import type { User } from './user';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  availability: Record<string, string[]>;
  specialities: string[];
}

export interface Appointment {
  id: string;
  doctor: Doctor;
  user: User;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'canceled';
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'success' | 'destructive' | 'info';
}
