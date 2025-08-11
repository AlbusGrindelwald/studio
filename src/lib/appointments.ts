

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
    if (isLoaded) return;

    try {
        const stored = localStorage.getItem(APPOINTMENTS_KEY);
        if (stored) {
            const loadedAppointments = JSON.parse(stored);
             // Ensure that nested doctor and user objects are fully hydrated from our data sources
            appointments = loadedAppointments.map((app: any) => ({
                ...app,
                doctor: findDoctorById(app.doctor.id) || app.doctor,
                user: findUserById(app.user.id) || app.user,
            }));
        } else {
            // Seed with initial data if nothing is in localStorage
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
            const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            const lastWeekStr = format(subDays(new Date(), 7), 'yyyy-MM-dd');
            
            const allDoctors = getDoctors();
            const allUsers = getUsers();

            const evelynReed = allDoctors.find(d => d.name === 'Dr. Evelyn Reed');
            const marcusThorne = allDoctors.find(d => d.name === 'Dr. Marcus Thorne');
            const lenaPetrova = allDoctors.find(d => d.name === 'Dr. Lena Petrova');
            const samuelChen = allDoctors.find(d => d.name === 'Dr. Samuel Chen');

            const user1 = allUsers.find(u => u.id === 'user1');
            const user2 = allUsers.find(u => u.id === 'user2');
            const user3 = allUsers.find(u => u.id === 'user3');

            // Find new users from the image
            const sarahJohnson = { id: 'user4', name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '1234567890'};
            const michaelChen = { id: 'user5', name: 'Michael Chen', email: 'michael.c@example.com', phone: '0987654321'};
            const emilyRodriguez = { id: 'user6', name: 'Emily Rodriguez', email: 'emily.r@example.com', phone: '1122334455'};
            // We need to add these users to the user list if they dont exist
            [sarahJohnson, michaelChen, emilyRodriguez].forEach(u => {
                if(!findUserById(u.id)) {
                    getUsers().push(u);
                }
            });


            appointments = [];

            if (evelynReed && user1) {
                appointments.push({ id: 'appt1', doctor: evelynReed, user: user1, date: todayStr, time: '10:00 AM', status: 'upcoming', type: 'Consultation', token: '1234' });
            }
            if (marcusThorne && user1) {
                 appointments.push({ id: 'appt4', doctor: marcusThorne, user: user1, date: tomorrowStr, time: '01:00 PM', status: 'upcoming', type: 'Consultation', token: '1237' });
            }
             if (evelynReed && user1) {
                appointments.push({ id: 'appt5', doctor: evelynReed, user: user1, date: yesterdayStr, time: '03:00 PM', status: 'completed', type: 'Consultation', token: '1238' });
            }
            if (lenaPetrova && user1) {
                appointments.push({ id: 'appt7', doctor: lenaPetrova, user: user1, date: lastWeekStr, time: '09:00 AM', status: 'completed', type: 'Check-up', token: '1240' });
            }
             if (samuelChen && user1) {
                appointments.push({ id: 'appt8', doctor: samuelChen, user: user1, date: '2024-08-21', time: '10:00 AM', status: 'canceled', type: 'Consultation', token: '1241' });
            }

            // Appointments for other users to ensure doctor's view is populated
            if (evelynReed) {
                appointments.push({ id: 'appt_sj', doctor: evelynReed, user: sarahJohnson, date: todayStr, time: '10:00 AM', status: 'upcoming', type: 'Consultation', token: '2001' });
                appointments.push({ id: 'appt_mc', doctor: evelynReed, user: michaelChen, date: todayStr, time: '11:30 AM', status: 'upcoming', type: 'Follow-up', token: '2002' });
                appointments.push({ id: 'appt_er', doctor: evelynReed, user: emilyRodriguez, date: todayStr, time: '02:00 PM', status: 'upcoming', token: '2003', type: 'Check-up' });
            }
            if (evelynReed && user2) {
                 appointments.push({ id: 'appt2', doctor: evelynReed, user: user2, date: tomorrowStr, time: '11:30 AM', status: 'upcoming', type: 'Follow-up', token: '1235' });
            }
            if (evelynReed && user3) {
                 appointments.push({ id: 'appt3', doctor: evelynReed, user: user3, date: tomorrowStr, time: '02:00 PM', status: 'upcoming', type: 'Check-up', token: '1236' });
            }
             if (evelynReed && user2) {
                appointments.push({ id: 'appt6', doctor: evelynReed, user: user2, date: '2024-08-21', time: '10:00 AM', status: 'canceled', type: 'Consultation', token: '1239' });
            }


            saveAppointments();
        }
    } catch(e) {
        console.error("Failed to parse appointments from localStorage", e);
        appointments = []; // Start fresh if there's a parsing error
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

export const getAppointmentsForDoctor = (): Appointment[] => {
    return appointments;
};

export const getPatientsForDoctor = (): User[] => {
    const doctorAppointments = getAppointmentsForDoctor();
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
