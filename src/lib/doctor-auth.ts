
export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  password?: string;
}

const DOCTOR_USERS_KEY = 'shedula_doctor_users';
const LOGGED_IN_DOCTOR_KEY = 'shedula_logged_in_doctor';
let doctorListeners: (() => void)[] = [];

const getDoctorUsers = (): DoctorUser[] => {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(DOCTOR_USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const saveDoctorUsers = (users: DoctorUser[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DOCTOR_USERS_KEY, JSON.stringify(users));
  notifyDoctorListeners();
};

const notifyDoctorListeners = () => {
  doctorListeners.forEach(listener => listener());
};

export const createDoctor = (newDoctor: Omit<DoctorUser, 'id'>) => {
  const doctors = getDoctorUsers();
  if (doctors.find(d => d.email === newDoctor.email)) {
    throw new Error('A doctor with this email already exists.');
  }

  const doctor: DoctorUser = { ...newDoctor, id: `doctor_${Date.now()}` };
  doctors.push(doctor);
  saveDoctorUsers(doctors);
  return doctor;
};

export const findDoctorByEmail = (email: string): DoctorUser | undefined => {
  const doctors = getDoctorUsers();
  return doctors.find(d => d.email === email);
};

export const findDoctorById = (id: string): DoctorUser | undefined => {
    const doctors = getDoctorUsers();
    return doctors.find(d => d.id === id);
}

export const loginDoctor = (email: string, password_provided: string): DoctorUser => {
  const doctor = findDoctorByEmail(email);
  if (!doctor || doctor.password !== password_provided) {
    throw new Error('Invalid email or password');
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGGED_IN_DOCTOR_KEY, doctor.id);
  }
  notifyDoctorListeners();
  return doctor;
};

export const logoutDoctor = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOGGED_IN_DOCTOR_KEY);
  }
  notifyDoctorListeners();
};

export const getLoggedInDoctor = (): DoctorUser | null => {
  if (typeof window === 'undefined') return null;
  const doctorId = localStorage.getItem(LOGGED_IN_DOCTOR_KEY);
  if (!doctorId) return null;
  return findDoctorById(doctorId) || null;
};

export const subscribeDoctor = (listener: () => void) => {
    doctorListeners.push(listener);
    return () => {
      const index = doctorListeners.indexOf(listener);
      if (index > -1) {
        doctorListeners.splice(index, 1);
      }
    };
};
