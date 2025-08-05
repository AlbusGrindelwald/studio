
import type { Appointment, Doctor } from './types';
import { User, getUsers } from './user';

let doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Evelyn Reed',
    email: 'evelyn.reed@shedula.com',
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
    },
    specialities: ['Hypertension', 'Heart Failure', 'Echocardiography', 'Coronary Artery Disease'],
    fees: 250,
    appointmentTypes: ['in-person', 'online'],
  },
  {
    id: '2',
    name: 'Dr. Marcus Thorne',
    email: 'marcus.thorne@shedula.com',
    specialty: 'Dermatologist',
    location: 'Metropolis, NY',
    rating: 4.8,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Dr. Thorne specializes in medical and cosmetic dermatology. He is an expert in treating acne, eczema, and performing minor skin surgeries, with a focus on innovative treatments.',
    availability: {
      '2024-08-15': ['08:00 AM', '08:30 AM', '09:00 AM'],
      '2024-08-18': ['01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM'],
      '2024-08-19': ['10:00 AM', '10:30 AM', '11:00 AM'],
    },
    specialities: ['Acne Treatment', 'Eczema Care', 'Skin Cancer Screening', 'Cosmetic Dermatology'],
    fees: 180,
    appointmentTypes: ['in-person'],
  },
  {
    id: '3',
    name: 'Dr. Lena Petrova',
    email: 'lena.petrova@shedula.com',
    specialty: 'Pediatrician',
    location: 'Oakwood, CA',
    rating: 5.0,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'With a friendly and warm demeanor, Dr. Petrova is a favorite among children and parents alike. She provides comprehensive care for infants, children, and adolescents.',
    availability: {
      '2024-08-16': ['10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM'],
      '2024-08-17': ['09:00 AM', '10:00 AM'],
      '2024-08-20': ['02:00 PM', '03:00 PM', '04:00 PM'],
    },
    specialities: ['Well-child visits', 'Vaccinations', 'Childhood Illnesses', 'Developmental Screening'],
    fees: 150,
    appointmentTypes: ['in-person', 'home-visit'],
  },
  {
    id: '4',
    name: 'Dr. Samuel Chen',
    email: 'samuel.chen@shedula.com',
    specialty: 'Orthopedic Surgeon',
    location: 'Rivertown, TX',
    rating: 4.7,
    reviews: 154,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Dr. Chen is a leading orthopedic surgeon specializing in sports injuries and joint replacement. He uses the latest minimally invasive techniques to ensure faster recovery for his patients.',
    availability: {
      '2024-08-15': ['11:00 AM', '03:00 PM'],
      '2024-08-18': ['09:00 AM', '10:00 AM', '11:00 AM'],
      '2024-08-21': ['08:00 AM', '09:00 AM'],
    },
    specialities: ['Sports Injuries', 'Joint Replacement', 'Arthroscopic Surgery', 'Fracture Care'],
    fees: 300,
    appointmentTypes: ['in-person', 'online'],
  },
];

// Re-exporting from user.ts to avoid circular dependencies
export { findUserById, findUserByEmailOrPhone, getUsers } from './user';

const allUsers = getUsers();
const patientUser = allUsers.find(u => u.email === 'patient@shedula.com') || allUsers[0];

export const appointments: Appointment[] = [
  // This is now handled in appointments.ts to avoid data conflicts
];

export const findDoctorById = (id: string): Doctor | undefined => {
  return doctors.find(doctor => doctor.id === id);
}

export const updatePublicDoctor = (id: string, updatedData: Partial<Doctor>): Doctor => {
  let updatedDoctor: Doctor | undefined;
  doctors = doctors.map(doc => {
    if (doc.id === id) {
      updatedDoctor = { ...doc, ...updatedData };
      return updatedDoctor;
    }
    return doc;
  });

  if (!updatedDoctor) {
    throw new Error('Doctor not found to update');
  }

  return updatedDoctor;
};

export const updateDoctorAvailability = (doctorId: string, date: string, slots: string[]): Doctor => {
    let updatedDoctor: Doctor | undefined;
    doctors = doctors.map(doc => {
        if (doc.id === doctorId) {
            const newAvailability = { ...doc.availability, [date]: slots };
            if (slots.length === 0) {
                delete newAvailability[date];
            }
            updatedDoctor = { ...doc, availability: newAvailability };
            return updatedDoctor;
        }
        return doc;
    });

    if (!updatedDoctor) {
        throw new Error('Doctor not found');
    }
    return updatedDoctor;
}


export const createPublicDoctorProfile = (data: any): Doctor => {
    const newPublicId = `doc_pub_${Date.now()}`;
    const newDoctor: Doctor = {
        id: newPublicId,
        name: `${data.title} ${data.name}`,
        email: data.email, // This should come from the logged-in doctor user.
        specialty: data.specialization,
        location: data.city,
        rating: 4.5, // Default rating
        reviews: 0, // Starts with 0 reviews
        image: 'https://placehold.co/128x128.png?text=Dr',
        description: `A dedicated ${data.specialization.toLowerCase()} based in ${data.city}.`,
        availability: {}, // Starts with empty availability
        specialities: [data.specialization],
        fees: 200, // Default fee
        appointmentTypes: ['in-person'],
    };

    doctors = [...doctors, newDoctor];
    // In a real app, you'd save this to a persistent database.
    // For this demo, it's just in memory for the session.
    
    return newDoctor;
}
