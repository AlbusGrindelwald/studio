import type { Appointment } from './types';
import { doctors, appointments as mockAppointments } from './data';

let appointments: Appointment[] = [...mockAppointments];

// This is a simple in-memory "database".
// In a real application, you would use a proper database.
const listeners: (() => void)[] = [];

export const getAppointments = (): Appointment[] => {
  return appointments;
};

export const addAppointment = (newAppointment: {
  doctorId: string;
  date: string;
  time: string;
}) => {
  const doctor = doctors.find(d => d.id === newAppointment.doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const appointment: Appointment = {
    id: `A${appointments.length + 1}`,
    doctor,
    date: newAppointment.date,
    time: newAppointment.time,
    status: 'upcoming',
  };

  appointments = [appointment, ...appointments];
  notifyListeners();
  return appointment;
};

export const updateAppointmentStatus = (id: string, status: 'upcoming' | 'completed' | 'canceled') => {
    appointments = appointments.map(app => 
        app.id === id ? { ...app, status } : app
    );
    notifyListeners();
};

export const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    appointments = appointments.map(app =>
        app.id === id ? { ...app, date: newDate, time: newTime } : app
    );
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
