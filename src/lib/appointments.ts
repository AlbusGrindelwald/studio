import type { Appointment } from './types';
import { doctors, appointments as mockAppointments } from './data';
import { addNotification } from './notifications';
import { format, parseISO } from 'date-fns';

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
