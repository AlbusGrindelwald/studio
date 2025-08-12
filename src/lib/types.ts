
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
  gender?: 'male' | 'female' | 'other';
  fees?: number;
  appointmentTypes?: ('in-person' | 'online' | 'home-visit')[];
}

export interface Appointment {
  id: string;
  doctor: Doctor;
  user: User;
  date: string; // "yyyy-MM-dd"
  time: string; // "HH:mm AM/PM"
  duration: number; // in minutes
  status: 'upcoming' | 'completed' | 'canceled' | 'pending';
  token: string;
  type?: 'Consultation' | 'Follow-up' | 'Check-up';
  reason?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'success' | 'destructive' | 'info';
}
