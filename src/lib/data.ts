
import type { Doctor, Appointment } from './types';

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    specialty: 'Cardiologist',
    location: 'Springfield, IL',
    rating: 4.9,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
    description: 'Dr. Reed is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She is known for her patient-centric approach and dedication to cardiovascular health.',
    availability: {
      '2024-08-15': ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'],
      '2024-08-16': ['09:30 AM', '11:30 AM', '01:30 PM', '03:00 PM'],
      '2024-08-17': ['10:00 AM', '12:00 PM'],
    }
  },
  {
    id: '2',
    name: 'Dr. Marcus Thorne',
    specialty: 'Dermatologist',
    location: 'Metropolis, NY',
    rating: 4.8,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da60710',
    description: 'Dr. Thorne specializes in medical and cosmetic dermatology. He is an expert in treating acne, eczema, and performing minor skin surgeries, with a focus on innovative treatments.',
    availability: {
      '2024-08-15': ['08:00 AM', '08:30 AM', '09:00 AM'],
      '2024-08-18': ['01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'],
      '2024-08-19': ['10:00 AM', '10:30 AM', '11:00 AM'],
    }
  },
  {
    id: '3',
    name: 'Dr. Lena Petrova',
    specialty: 'Pediatrician',
    location: 'Oakwood, CA',
    rating: 5.0,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1612276532431-c44a56e09341',
    description: 'With a friendly and warm demeanor, Dr. Petrova is a favorite among children and parents alike. She provides comprehensive care for infants, children, and adolescents.',
    availability: {
      '2024-08-16': ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM'],
      '2024-08-17': ['09:00 AM', '10:00 AM'],
      '2024-08-20': ['02:00 PM', '03:00 PM', '04:00 PM'],
    }
  },
  {
    id: '4',
    name: 'Dr. Samuel Chen',
    specialty: 'Orthopedic Surgeon',
    location: 'Rivertown, TX',
    rating: 4.7,
    reviews: 154,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54',
    description: 'Dr. Chen is a leading orthopedic surgeon specializing in sports injuries and joint replacement. He uses the latest minimally invasive techniques to ensure faster recovery for his patients.',
    availability: {
      '2024-08-15': ['11:00 AM', '03:00 PM'],
      '2024-08-18': ['09:00 AM', '10:00 AM', '11:00 AM'],
      '2024-08-21': ['08:00 AM', '09:00 AM'],
    }
  },
];

export const appointments: Appointment[] = [
  {
    id: 'A1',
    doctor: doctors[0],
    date: '2024-08-25',
    time: '10:00 AM',
    status: 'upcoming',
  },
  {
    id: 'A2',
    doctor: doctors[2],
    date: '2024-09-02',
    time: '11:00 AM',
    status: 'upcoming',
  },
  {
    id: 'A3',
    doctor: doctors[1],
    date: '2024-07-20',
    time: '01:30 PM',
    status: 'completed',
  },
];

export const findDoctorById = (id: string) => doctors.find(doctor => doctor.id === id);
