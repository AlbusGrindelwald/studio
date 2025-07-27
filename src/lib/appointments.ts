
import type { Appointment, Doctor } from './types';
import { doctors, appointments as mockAppointments, findUserByEmail, findUserById } from './data';
import { addNotification } from './notifications';
import { format, parseISO } from 'date-fns';
import { User } from './user';

let appointments: Appointment[] = [...mockAppointments];

// This is a simple in-memory "database".
// In a real application, you would use a proper database.
const listeners: (() => void)[] = [];

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
    id: `A${appointments.length + 1}`,
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

  notifyListeners();
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

    notifyListeners();
};

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

    notifyListeners();
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

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};
