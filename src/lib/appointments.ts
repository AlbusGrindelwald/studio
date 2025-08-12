
import type { Appointment, Doctor } from './types';
import { findUserById, getDoctors, findDoctorById } from './data';
import { addNotification } from './notifications';
import { format, parseISO, isToday, addDays, subDays } from 'date-fns';
import { User, getUsers } from './user';
import { getLoggedInDoctor } from './doctor-auth';

const APPOINTMENTS_KEY = 'shedula_appointments';
let appointments: Appointment[] = [];
const listeners: (() => void)[] = [];

let isLoaded = false;

const loadAppointments = () => {
    if (typeof window === 'undefined') {
        return;
    }
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const genericDoctor = getDoctors()[0]; 

    // Find or create users for the static appointments
    let user1 = findUserById('user_liam');
    if (!user1) {
        user1 = { id: 'user_liam', name: 'Liam Neeson', email: 'liam.n@example.com', phone: '1234567891', image: `https://placehold.co/40x40.png?text=L` };
    }
    let user2 = findUserById('user_olivia');
    if (!user2) {
        user2 = { id: 'user_olivia', name: 'Olivia Chen', email: 'olivia.c@example.com', phone: '1234567892', image: `https://placehold.co/40x40.png?text=O` };
    }
    let user3 = findUserById('user_noah');
    if (!user3) {
        user3 = { id: 'user_noah', name: 'Noah Patel', email: 'noah.p@example.com', phone: '1234567893', image: `https://placehold.co/40x40.png?text=N` };
    }
    let user4 = findUserById('user_emma');
    if (!user4) {
        user4 = { id: 'user_emma', name: 'Emma Stone', email: 'emma.s@example.com', phone: '1234567894', image: `https://placehold.co/40x40.png?text=E` };
    }
    
    // Always use this static list, ignoring localStorage for this feature.
    appointments = [
        { id: 'appt_liam', doctor: genericDoctor, user: user1, date: todayStr, time: '10:00 AM', status: 'upcoming', type: 'Consultation', token: '3001' },
        { id: 'appt_olivia', doctor: genericDoctor, user: user2, date: todayStr, time: '11:30 AM', status: 'upcoming', type: 'Follow-up', token: '3002' },
        { id: 'appt_emma', doctor: genericDoctor, user: user4, date: todayStr, time: '12:30 PM', status: 'canceled', token: '3004', type: 'Routine Check' },
        { id: 'appt_noah', doctor: genericDoctor, user: user3, date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '02:00 PM', status: 'upcoming', token: '3003', type: 'Check-up' },
    ];

    saveAppointments();
    isLoaded = true;
};

const saveAppointments = () => {
    if (typeof window === 'undefined') return;
    // We are no longer saving to localStorage to ensure data is always static
    // localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

loadAppointments();

export const getAppointments = (): Appointment[] => {
  // Directly call loadAppointments to ensure the static data is always fresh.
  loadAppointments();
  return appointments;
};

export const getAppointmentsForUser = (userId: string): Appointment[] => {
    return appointments.filter(app => app.user && app.user.id === userId);
};

export const getAppointmentsForDoctor = (): Appointment[] => {
    // Call loadAppointments to reset to the static list every time.
    loadAppointments();
    return appointments;
};

export const getPatientsForDoctor = (): User[] => {
    return [];
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

  if (doctor.id === '1' && newAppointment.time === '02:00 PM' && !isToday(parseISO(newAppointment.date))) {
    throw new Error('Booking Failed: This slot is no longer available.');
  }

  const appointment: Appointment = {
    id: `A${Date.now()}`,
    doctor,
    user,
    date: newAppointment.date,
    time: newAppointment.time,
    status: 'upcoming',
    token: newAppointment.token,
    type: 'Consultation',
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
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};
