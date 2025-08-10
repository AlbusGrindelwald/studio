

import type { Appointment, Doctor } from './types';
import { findUserById, findDoctorById, getDoctors } from './data';
import { addNotification } from './notifications';
import { format, parseISO, isToday } from 'date-fns';
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
    if (isLoaded) return;

    try {
        const stored = localStorage.getItem(APPOINTMENTS_KEY);
        if (stored) {
            const loadedAppointments = JSON.parse(stored);
            appointments = loadedAppointments.map((app: any) => ({
                ...app,
                doctor: findDoctorById(app.doctor.id) || app.doctor,
                user: findUserById(app.user.id) || app.user,
            }));
        } else {
            // Seed with initial data if nothing is in localStorage
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            appointments = [
                { id: 'appt1', doctor: findDoctorById('1')!, user: findUserById('user1')!, date: todayStr, time: '10:00 AM', status: 'upcoming', type: 'Consultation', token: '1234' },
                { id: 'appt2', doctor: findDoctorById('1')!, user: findUserById('user2')!, date: todayStr, time: '11:30 AM', status: 'upcoming', type: 'Follow-up', token: '1235' },
                { id: 'appt3', doctor: findDoctorById('1')!, user: findUserById('user3')!, date: todayStr, time: '02:00 PM', status: 'upcoming', type: 'Check-up', token: '1236' },
                { id: 'appt4', doctor: findDoctorById('2')!, user: findUserById('user1')!, date: '2024-08-18', time: '01:00 PM', status: 'upcoming', type: 'Consultation', token: '1237' },
                { id: 'appt5', doctor: findDoctorById('1')!, user: findUserById('user1')!, date: '2024-08-20', time: '03:00 PM', status: 'completed', type: 'Consultation', token: '1238' },
                { id: 'appt6', doctor: findDoctorById('1')!, user: findUserById('user2')!, date: '2024-08-21', time: '10:00 AM', status: 'canceled', type: 'Consultation', token: '1239' },
            ];
            saveAppointments();
        }
    } catch(e) {
        console.error("Failed to parse appointments from localStorage", e);
        appointments = [];
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

loadAppointments();

export const getAppointments = (): Appointment[] => {
  return appointments;
};

export const getAppointmentsForUser = (userId: string): Appointment[] => {
    return appointments.filter(app => app.user && app.user.id === userId);
};

export const getAppointmentsForDoctor = (doctorEmail: string): Appointment[] => {
    return appointments.filter(app => app.doctor && app.doctor.email === doctorEmail);
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
