

export interface User {
  id: string; // This will be the Firebase UID
  name: string;
  email: string;
  phone?: string;
}

// This is a simple in-memory "database" using localStorage.
// In a real application, you would use a proper database.
const listeners: (() => void)[] = [];
const USERS_KEY = 'shedula_users';
const LOGGED_IN_USER_KEY = 'shedula_logged_in_user';

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  notifyListeners();
};

export const createUser = (newUser: Omit<User, 'password'>) => {
  const users = getUsers();
  // Firebase already handles email uniqueness, so we primarily check here to avoid local data conflicts.
  const existingUser = users.find(u => u.id === newUser.id || u.email === newUser.email);
  if (existingUser) {
    console.warn('User already exists in local storage.');
    return existingUser;
  }
  
  if (newUser.phone) {
    const existingUserByPhone = users.find(u => u.phone === newUser.phone);
    if (existingUserByPhone) {
        throw new Error('An account with this phone number already exists.');
    }
  }

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const findUserByEmailOrPhone = (identifier: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email === identifier || u.phone === identifier);
};

export const findUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const updateUserWithPhone = (id: string, phone: string) => {
    let users = getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    if(userIndex > -1) {
        users[userIndex].phone = phone;
        saveUsers(users);
    }
};

export const loginUser = (userId: string) => {
  if (typeof window === 'undefined') return;
  const user = findUserById(userId);
  if (!user) {
    console.error("Attempted to log in a user that doesn't exist in local storage:", userId);
    return;
  }
  localStorage.setItem(LOGGED_IN_USER_KEY, userId);
  notifyListeners();
};

export const logoutUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOGGED_IN_USER_KEY);
  notifyListeners();
};

export const getLoggedInUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userId = localStorage.getItem(LOGGED_IN_USER_KEY);
  if (!userId) return null;
  return findUserById(userId) || null;
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

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};
