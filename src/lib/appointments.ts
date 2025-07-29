
import type { Appointment, Doctor } from './types';
import { doctors, findUserById } from './data';
import { addNotification } from './notifications';
import { format, parseISO } from 'date-fns';
import { User } from './user';

const APPOINTMENTS_KEY = 'shedula_appointments';
let appointments: Appointment[] = [];
const listeners: (() => void)[] = [];

// Hardcoded initial data
const mockAppointments: Appointment[] = [
  {
    id: 'A1',
    doctor: doctors[2],
    user: { id: 'user1', name: 'John Doe', email: 'patient@shedula.com' },
    date: '2024-08-20',
    time: '10:00 AM',
    status: 'completed',
    token: '1234',
  },
  {
    id: 'A2',
    doctor: doctors[0],
    user: { id: 'user1', name: 'John Doe', email: 'patient@shedula.com' },
    date: '2024-07-15',
    time: '09:00 AM',
    status: 'completed',
    token: '5678',
  },
  {
    id: 'A3',
    doctor: doctors[1],
    user: { id: 'user1', name: 'John Doe', email: 'patient@shedula.com' },
    date: '2024-06-25',
    time: '02:30 PM',
    status: 'completed',
    token: '9101',
  },
  {
    id: 'A4',
    doctor: doctors[3],
    user: { id: 'user1', name: 'John Doe', email: 'patient@shedula.com' },
    date: '2024-08-25',
    time: '11:00 AM',
    status: 'upcoming',
    token: '1121',
  },
];


const loadAppointments = () => {
    if (typeof window === 'undefined') return;
    // For this fix, we will clear the local storage ONCE to ensure no bad data persists.
    // In a real app, this might be handled by a versioning system.
    if (!localStorage.getItem('shedula_data_migrated_v1')) {
        localStorage.removeItem(APPOINTMENTS_KEY);
        localStorage.setItem('shedula_data_migrated_v1', 'true');
    }

    try {
        const stored = localStorage.getItem(APPOINTMENTS_KEY);
        // If there's no data in local storage, initialize it with our mock data.
        if (!stored || JSON.parse(stored).length === 0) {
            appointments = mockAppointments;
            saveAppointments();
        } else {
             // Otherwise, load the existing data.
            appointments = JSON.parse(stored);
        }
    } catch(e) {
        console.error("Failed to parse appointments from localStorage", e);
        // Fallback to mock data if parsing fails
        appointments = mockAppointments;
    }
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
if (typeof window !== 'undefined') {
  loadAppointments();
}

export const getAppointments = (): Appointment[] => {
  return appointments;
};

export const getAppointmentsForDoctor = (doctorEmail: string): Appointment[] => {
    return appointments.filter(app => app.doctor.email === doctorEmail);
}

export const getPatientsForDoctor = (doctorEmail: string): User[] => {
    const doctorAppointments = getAppointmentsForDoctor(doctorEmail);
    const patientIds = new Set(doctorAppointments.map(app => app.user.id));
    const uniquePatients: User[] = [];
    patientIds.forEach(id => {
        const user = findUserById(id);
        if (user) {
            uniquePatients.push(user);
        }
    });
    return uniquePatients;
}

export const addAppointment = (newAppointment: {
  doctorId: string;
  date: string;
  time: string;
  userId: string;
  token: string;
}) => {
  const doctor = doctors.find(d => d.id === newAppointment.doctorId);
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
