
export interface DoctorUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  publicId?: string; // Links to the public Doctor profile
}

const DOCTOR_USERS_KEY = 'shedula_doctor_users';
const LOGGED_IN_DOCTOR_KEY = 'shedula_logged_in_doctor';
let doctorListeners: (() => void)[] = [];

// Initial hardcoded doctor users linked to public profiles
const initialDoctorUsers: DoctorUser[] = [
    { id: 'doc_auth_1', name: 'Dr. Evelyn Reed', email: 'evelyn.reed@shedula.com', password: 'password', publicId: '1' },
    { id: 'doc_auth_2', name: 'Dr. Marcus Thorne', email: 'marcus.thorne@shedula.com', password: 'password', publicId: '2' },
    { id: 'doc_auth_3', name: 'Dr. Lena Petrova', email: 'lena.petrova@shedula.com', password: 'password', publicId: '3' },
    { id: 'doc_auth_4', name: 'Dr. Samuel Chen', email: 'samuel.chen@shedula.com', password: 'password', publicId: '4' },
];

const getDoctorUsers = (): DoctorUser[] => {
  if (typeof window === 'undefined') return initialDoctorUsers;
  const usersJson = localStorage.getItem(DOCTOR_USERS_KEY);
  if (!usersJson) {
      // Initialize with hardcoded data if none exists
      saveDoctorUsers(initialDoctorUsers);
      return initialDoctorUsers;
  }
  return JSON.parse(usersJson);
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

export const updateDoctor = (id: string, updates: Partial<Omit<DoctorUser, 'id'>>) => {
    let doctors = getDoctorUsers();
    let updatedDoctor: DoctorUser | null = null;
    const newDoctors = doctors.map(d => {
        if(d.id === id) {
            updatedDoctor = { ...d, ...updates };
            return updatedDoctor;
        }
        return d;
    });

    if (!updatedDoctor) {
        throw new Error('Doctor not found');
    }
    
    saveDoctorUsers(newDoctors);
    return updatedDoctor;
}

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
