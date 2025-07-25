
import type { Doctor } from './types';
import { doctors } from './data';
import { addNotification } from './notifications';

const WISHLIST_KEY = 'shedula_wishlist';
let wishlistedDoctorIds: string[] = [];
const listeners: (() => void)[] = [];

const loadWishlist = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(WISHLIST_KEY);
    wishlistedDoctorIds = stored ? JSON.parse(stored) : [];
};

const saveWishlist = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistedDoctorIds));
    notifyListeners();
};

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

// Initialize wishlist on load
if (typeof window !== 'undefined') {
    loadWishlist();
}

export const getWishlist = (): Doctor[] => {
    return doctors.filter(doctor => wishlistedDoctorIds.includes(doctor.id));
};

export const isDoctorInWishlist = (doctorId: string): boolean => {
    return wishlistedDoctorIds.includes(doctorId);
};

export const addToWishlist = (doctorId: string) => {
    if (!isDoctorInWishlist(doctorId)) {
        wishlistedDoctorIds.push(doctorId);
        saveWishlist();

        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
            addNotification({
                title: 'Added to Wishlist',
                description: `${doctor.name} has been added to your wishlist.`,
                type: 'info'
            });
        }
    }
};

export const removeFromWishlist = (doctorId: string) => {
    const index = wishlistedDoctorIds.indexOf(doctorId);
    if (index > -1) {
        wishlistedDoctorIds.splice(index, 1);
        saveWishlist();

         const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
            addNotification({
                title: 'Removed from Wishlist',
                description: `${doctor.name} has been removed from your wishlist.`,
                type: 'destructive'
            });
        }
    }
};

export const toggleWishlist = (doctorId: string) => {
    if (isDoctorInWishlist(doctorId)) {
        removeFromWishlist(doctorId);
    } else {
        addToWishlist(doctorId);
    }
};

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
