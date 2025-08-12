

import type { Appointment, Doctor } from './types';
import { findUserById, getDoctors, findDoctorById, getUsers } from './data';
import { addNotification } from './notifications';
import { format, parseISO, isToday, addDays, subDays } from 'date-fns';
import { User } from './user';
import { getLoggedInDoctor } from './doctor-auth';

const APPOINTMENTS_KEY = 'shedula_appointments';
let appointments: Appointment[] = [];
const listeners: (() => void)[] = [];

let isLoaded = false;

const loadAppointments = () => {
    // if (typeof window !== 'undefined' && isLoaded) {
    //     // Data is already loaded, and we want to keep it static for the session.
    //     return;
    // }
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const genericDoctor = getDoctors()[0]; 

    const users = getUsers();
    const user1 = users.find(u => u.name === 'John Doe') || users[0];
    const user2 = users.find(u => u.name === 'Jane Smith') || users[1];
    const user3 = users.find(u => u.name === 'Peter Jones') || users[2];
    
    // Static list of appointments, always loaded this way.
    appointments = [
        { 
            id: 'appt_sarah', 
            doctor: genericDoctor, 
            user: { ...user1, name: 'Sarah Johnson', phone: '+1 (555) 123-4567' },
            date: todayStr,
            time: '10:00 AM', 
            duration: 30,
            status: 'upcoming', 
            token: '3001', 
            type: 'Consultation',
            reason: 'Regular checkup',
            notes: 'Patient reports feeling well.'
        },
        { 
            id: 'appt_michael',
            doctor: genericDoctor,
            user: { ...user2, name: 'Michael Chen', phone: '+1 (555) 234-5678' },
            date: todayStr, 
            time: '11:30 AM', 
            duration: 45,
            status: 'upcoming', 
            token: '3002', 
            type: 'Follow-up',
            reason: 'Blood pressure monitoring',
            notes: 'Follow-up on medication adjustment.'
        },
        { 
            id: 'appt_emily', 
            doctor: genericDoctor, 
            user: { ...user3, name: 'Emily Rodriguez', phone: '+1 (555) 345-6789' },
            date: todayStr, 
            time: '02:00 PM', 
            duration: 30,
            status: 'pending', 
            token: '3003',
            type: 'Check-up',
            reason: 'Annual physical exam',
            notes: 'Wants to discuss diet and exercise.'
        },
         { 
            id: 'appt_david', 
            doctor: genericDoctor, 
            user: { ...user1, id: 'user4', name: 'David Lee', phone: '+1 (555) 456-7890' },
            date: todayStr, 
            time: '03:00 PM', 
            duration: 20,
            status: 'canceled', 
            token: '3004',
            type: 'Consultation',
            reason: 'Sore throat',
            notes: 'Patient canceled due to a conflict.'
        },
         { 
            id: 'appt_jessica', 
            doctor: genericDoctor, 
            user: { ...user2, id: 'user5', name: 'Jessica Miller', phone: '+1 (555) 567-8901' },
            date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), 
            time: '09:00 AM', 
            duration: 60,
            status: 'upcoming', 
            token: '3005',
            type: 'Consultation',
            reason: 'Second opinion for knee surgery.',
            notes: ''
        },
    ];

    saveAppointments();
    isLoaded = true;
};

const saveAppointments = () => {
    // No-op for saving to localStorage to keep data static per session load.
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
    loadAppointments();
    return appointments;
};

export const getPatientsForDoctor = (): User[] => {
    return [
      {
        id: 'user1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        condition: 'Hypertension',
        status: 'stable',
      },
      {
        id: 'user2',
        name: 'Lisa Wilson',
        email: 'lisa.wilson@example.com',
        condition: 'Diabetes',
        status: 'monitoring',
      },
    ];
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
    duration: 30, // default
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

export const updateAppointmentStatus = (id: string, status: 'upcoming' | 'completed' | 'canceled' | 'pending') => {
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
