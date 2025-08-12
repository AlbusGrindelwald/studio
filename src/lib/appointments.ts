

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
    let sarah = findUserById('user_sarah');
    if (!sarah) {
        sarah = { id: 'user_sarah', name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '1234567891', image: `https://placehold.co/40x40.png?text=S` };
    }
    let michael = findUserById('user_michael');
    if (!michael) {
        michael = { id: 'user_michael', name: 'Michael Chen', email: 'michael.c@example.com', phone: '1234567892', image: `https://placehold.co/40x40.png?text=M` };
    }
    let emily = findUserById('user_emily');
    if (!emily) {
        emily = { id: 'user_emily', name: 'Emily Rodriguez', email: 'emily.r@example.com', phone: '1234567893', image: `https://placehold.co/40x40.png?text=E` };
    }
    
    // Always use this static list, ignoring localStorage for this feature.
    appointments = [
        { id: 'appt_sarah', doctor: genericDoctor, user: sarah, date: todayStr, time: '10:00 AM', status: 'upcoming', type: 'Consultation', token: '3001' },
        { id: 'appt_michael', doctor: genericDoctor, user: michael, date: todayStr, time: '11:30 AM', status: 'upcoming', type: 'Follow-up', token: '3002' },
        { id: 'appt_emily', doctor: genericDoctor, user: emily, date: todayStr, time: '02:00 PM', status: 'canceled', token: '3003', type: 'Check-up' },
    ];

    saveAppointments();
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

loadAppointments();

export const getAppointments = (): Appointment[] => {
  return appointments;
};

export const getAppointmentsForUser = (userId: string): Appointment[] => {
    return appointments.filter(app => app.user && app.user.id === userId);
};

export const getAppointmentsForDoctor = (): Appointment[] => {
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
