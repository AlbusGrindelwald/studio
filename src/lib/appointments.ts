

import type { Appointment, Doctor } from './types';
import { doctors, findUserById, findDoctorById } from './data';
import { addNotification } from './notifications';
import { format, parseISO } from 'date-fns';
import { User, getUsers } from './user';
import { getLoggedInDoctor } from './doctor-auth';

const APPOINTMENTS_KEY = 'shedula_appointments';
let appointments: Appointment[] = [];
const listeners: (() => void)[] = [];

let isLoaded = false;

const allUsers = getUsers();
// Hardcoded initial data
const mockAppointments: Appointment[] = [
  {
    id: 'A1',
    doctor: doctors[2], // Dr. Lena Petrova
    user: allUsers[0] || { id: 'user1', name: 'John Doe', email: 'patient@shedula.com' },
    date: '2024-08-20',
    time: '10:00 AM',
    status: 'completed',
    token: '1234',
  },
  {
    id: 'A2',
    doctor: doctors[0], // Dr. Evelyn Reed
    user: allUsers[1] || { id: 'user2', name: 'Jane Smith', email: 'jane.smith@example.com' },
    date: '2024-07-15',
    time: '09:00 AM',
    status: 'completed',
    token: '5678',
  },
  {
    id: 'A3',
    doctor: doctors[0], // Dr. Evelyn Reed
    user: allUsers[0] || { id: 'user1', name: 'John Doe', email: 'patient@shedula.com' },
    date: '2024-06-25',
    time: '02:30 PM',
    status: 'completed',
    token: '9101',
  },
  {
    id: 'A4',
    doctor: doctors[3], // Dr. Samuel Chen
    user: allUsers[2] || { id: 'user3', name: 'Peter Jones', email: 'peter.jones@example.com' },
    date: '2024-08-25',
    time: '11:00 AM',
    status: 'upcoming',
    token: '1121',
  },
   {
    id: 'A5',
    doctor: doctors[0], // Dr. Evelyn Reed
    user: allUsers[2] || { id: 'user3', name: 'Peter Jones', email: 'peter.jones@example.com' },
    date: '2024-08-28',
    time: '02:00 PM',
    status: 'upcoming',
    token: '1122',
  },
];


const loadAppointments = () => {
    if (typeof window === 'undefined' || isLoaded) return;

    try {
        const stored = localStorage.getItem(APPOINTMENTS_KEY);
        if (!stored) {
            // If nothing is in storage, initialize with mock data.
            appointments = mockAppointments;
            saveAppointments();
        } else {
            // If data exists, parse it and ensure it's in the correct structure.
            const loadedAppointments = JSON.parse(stored);
            // Re-hydrate the doctor and user objects to ensure they are complete.
            appointments = loadedAppointments.map((app: any) => ({
                ...app,
                doctor: findDoctorById(app.doctor.id) || app.doctor,
                user: findUserById(app.user.id) || app.user,
            }));
        }
    } catch(e) {
        console.error("Failed to parse appointments from localStorage", e);
        // Fallback to mock data if parsing fails
        appointments = mockAppointments;
    }
    isLoaded = true;
};

const saveAppointments = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Initialize appointments on load
loadAppointments();

export const getAppointments = (): Appointment[] => {
  return appointments;
};

export const getAppointmentsForUser = (userId: string): Appointment[] => {
    return appointments.filter(app => app.user.id === userId);
};

export const getAppointmentsForDoctor = (doctorEmail: string): Appointment[] => {
    return appointments.filter(app => app.doctor.email === doctorEmail);
}

export const getPatientsForDoctor = (doctorEmail: string): User[] => {
    const doctorAppointments = getAppointmentsForDoctor(doctorEmail);
    const patientMap = new Map<string, User>();
    doctorAppointments.forEach(app => {
        if (app.user && !patientMap.has(app.user.id)) {
             const lastVisit = doctorAppointments
                .filter(a => a.user.id === app.user.id)
                .map(a => parseISO(a.date))
                .sort((a,b) => b.getTime() - a.getTime())[0];
            
            patientMap.set(app.user.id, { ...app.user, lastVisit: lastVisit ? format(lastVisit, 'yyyy-MM-dd') : 'N/A' });
        }
    });
    return Array.from(patientMap.values());
}

export const addAppointment = (newAppointment: {
  doctorId: string;
  date: string;
  time: string;
  userId: string;
  token: string;
}) => {
  const doctor = findDoctorById(newAppointment.doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const user = findUserById(newAppointment.userId);
  if(!user) {
    throw new Error('User not found');
  }

  // Simulate a booking failure for a specific doctor and time
  if (doctor.id === '1' && newAppointment.time === '02:00 PM') {
    throw new Error('Booking Failed: This slot is no longer available.');
  }

  const appointment: Appointment = {
    id: `A${Date.now()}`, // Ensure unique ID
    doctor,
    user,
    date: newAppointment.date,
    time: newAppointment.time,
    status: 'upcoming',
    token: newAppointment.token,
  };

  appointments = [appointment, ...appointments];

  addNotification({
      title: 'Appointment Booked!',
      description: `Your appointment with ${doctor.name} on ${format(parseISO(newAppointment.date), 'MMM d, yyyy')} at ${newAppointment.time} is confirmed.`,
      type: 'success'
  });

  saveAppointments();
  return appointment;
};

export const updateAppointmentStatus = (id: string, status: 'upcoming' | 'completed' | 'canceled') => {
    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return;
    
    appointments = appointments.map(app => 
        app.id === id ? { ...app, status } : app
    );

    if (status === 'canceled') {
        addNotification({
            title: 'Appointment Canceled',
            description: `Your appointment with ${appointment.doctor.name} on ${format(parseISO(appointment.date), 'MMM d, yyyy')} has been canceled.`,
            type: 'destructive'
        });
    }

    saveAppointments();
};

export const clearCanceledAppointments = () => {
    appointments = appointments.filter(app => app.status !== 'canceled');
    addNotification({
        title: 'History Cleared',
        description: 'Your canceled appointment history has been cleared.',
        type: 'info'
    });
    saveAppointments();
}

export const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    const appointment = appointments.find(app => app.id === id);
    if (!appointment) return;
    
    appointments = appointments.map(app =>
        app.id === id ? { ...app, date: newDate, time: newTime } : app
    );
    
    addNotification({
        title: 'Appointment Rescheduled',
        description: `Your appointment with ${appointment.doctor.name} has been moved to ${format(parseISO(newDate), 'MMM d, yyyy')} at ${newTime}.`,
        type: 'info'
    });

    saveAppointments();
}

export const subscribe = (listener: () => void) => {
  listeners.push(listener);
  // Return an unsubscribe function
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};
