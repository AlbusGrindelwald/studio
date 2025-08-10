
'use client';

import { createPublicDoctorProfile, findDoctorByPublicId } from './data';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

export interface DoctorUser {
  id: string; // This will be the Firebase UID
  name: string;
  email: string;
  publicId?: string; // Links to the public Doctor profile
}

const DOCTOR_USERS_KEY = 'shedula_doctor_users';
const LOGGED_IN_DOCTOR_KEY = 'shedula_logged_in_doctor';
let doctorListeners: (() => void)[] = [];

// Initial hardcoded doctor users linked to public profiles
const initialDoctorUsers: DoctorUser[] = [
  { id: 'doc_auth_1', name: 'Dr. Evelyn Reed', email: 'evelyn.reed@shedula.com', publicId: '1' },
  { id: 'doc_auth_2', name: 'Dr. Marcus Thorne', email: 'marcus.thorne@shedula.com', publicId: '2' },
  { id: 'doc_auth_3', name: 'Dr. Lena Petrova', email: 'lena.petrova@shedula.com', publicId: '3' },
  { id: 'doc_auth_4', name: 'Dr. Samuel Chen', email: 'samuel.chen@shedula.com', publicId: '4' },
];

const getDoctorUsers = (): DoctorUser[] => {
  if (typeof window === 'undefined') return initialDoctorUsers;
  try {
    const usersJson = localStorage.getItem(DOCTOR_USERS_KEY);
    if (!usersJson) {
      saveDoctorUsers(initialDoctorUsers);
      return initialDoctorUsers;
    }
    return JSON.parse(usersJson);
  } catch(e) {
    console.error("Failed to parse doctor users from localStorage", e);
    saveDoctorUsers(initialDoctorUsers);
    return initialDoctorUsers;
  }
};

const saveDoctorUsers = (users: DoctorUser[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DOCTOR_USERS_KEY, JSON.stringify(users));
  notifyDoctorListeners();
};

const notifyDoctorListeners = () => {
  doctorListeners.forEach(listener => listener());
};

export const createDoctorAccount = async (newDoctorData: Omit<DoctorUser, 'id' | 'publicId'> & { password_provided: string }): Promise<FirebaseUser> => {
  const { email, password_provided, name } = newDoctorData;
  const userCredential = await createUserWithEmailAndPassword(auth, email, password_provided);
  const firebaseUser = userCredential.user;

  const localDoctorData: DoctorUser = {
    id: firebaseUser.uid,
    name,
    email,
  };
  
  const doctors = getDoctorUsers();
  if (doctors.find(d => d.email === email)) {
    throw new Error('A doctor with this email already exists in the local store.');
  }

  doctors.push(localDoctorData);
  saveDoctorUsers(doctors);

  return firebaseUser;
};


export const loginDoctor = async (email: string, password_provided: string): Promise<DoctorUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password_provided);
  const firebaseUser = userCredential.user;

  let localDoctor = findDoctorById(firebaseUser.uid);
  if (!localDoctor) {
    // If a user exists in Firebase but not locally, create a local record
    localDoctor = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Doctor',
    };
    const doctors = getDoctorUsers();
    doctors.push(localDoctor);
    saveDoctorUsers(doctors);
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOGGED_IN_DOCTOR_KEY, localDoctor.id);
  }
  notifyDoctorListeners();
  return localDoctor;
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

export const completeDoctorProfile = (doctorId: string, profileData: any) => {
    let doctor = findDoctorById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

    const publicProfile = createPublicDoctorProfile(profileData);
    
    updateDoctor(doctorId, { publicId: publicProfile.id });

    return publicProfile;
}

export const findDoctorByEmail = (email: string): DoctorUser | undefined => {
  const doctors = getDoctorUsers();
  return doctors.find(d => d.email === email);
};

export const findDoctorById = (id: string): DoctorUser | undefined => {
    const doctors = getDoctorUsers();
    return doctors.find(d => d.id === id);
}

export const logoutDoctor = async () => {
  await signOut(auth);
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
