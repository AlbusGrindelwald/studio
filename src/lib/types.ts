export interface Doctor {
  id: string;
  name: string;
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
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'canceled';
}
