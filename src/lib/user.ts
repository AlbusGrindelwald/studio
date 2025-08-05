

export interface User {
  id: string; // This will be the Firebase UID
  name: string;
  email: string;
  phone?: string;
  image?: string; // To store the profile image URL
  lastVisit?: string;
}

// This is a simple in-memory "database" using localStorage.
// In a real application, you would use a proper database.
const listeners: (() => void)[] = [];
const USERS_KEY = 'shedula_users';
const LOGGED_IN_USER_KEY = 'shedula_logged_in_user';

let isLoaded = false;
let users: User[] = [];

const initialUsers: User[] = [
    {
        id: 'user1',
        name: 'John Doe',
        email: 'patient@shedula.com',
        phone: '1112223333',
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
        lastVisit: '2024-07-10',
    },
    {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '4445556666',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        lastVisit: '2024-06-22',
    },
     {
        id: 'user3',
        name: 'Peter Jones',
        email: 'peter.jones@example.com',
        phone: '7778889999',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        lastVisit: '2024-05-15',
    },
];

const loadUsers = () => {
    if (typeof window === 'undefined' || isLoaded) return;
    const usersJson = localStorage.getItem(USERS_KEY);
    if (usersJson) {
        try {
            users = JSON.parse(usersJson);
        } catch (e) {
            console.error("Failed to parse users, initializing with default.", e);
            users = initialUsers;
        }
    } else {
        users = initialUsers;
    }
    isLoaded = true;
};

loadUsers();

export const getUsers = (): User[] => {
  return users;
};

const saveUsers = (newUsers: User[]) => {
  users = newUsers;
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  notifyListeners();
};

export const createUser = (newUser: User) => {
  const currentUsers = getUsers();
  // Firebase already handles email uniqueness, so we primarily check here to avoid local data conflicts.
  const existingUser = currentUsers.find(u => u.id === newUser.id || u.email === newUser.email);
  if (existingUser) {
    console.warn('User already exists in local storage.');
    return existingUser;
  }
  
  if (newUser.phone) {
    const existingUserByPhone = currentUsers.find(u => u.phone === newUser.phone);
    if (existingUserByPhone) {
        throw new Error('An account with this phone number already exists.');
    }
  }

  const updatedUsers = [...currentUsers, newUser];
  saveUsers(updatedUsers);
  return newUser;
};

export const findUserByEmailOrPhone = (identifier: string): User | undefined => {
  const currentUsers = getUsers();
  return currentUsers.find(u => u.email === identifier || u.phone === identifier);
};

export const findUserById = (id: string): User | undefined => {
  const currentUsers = getUsers();
  return currentUsers.find(u => u.id === id);
};

export const updateUser = (id: string, updates: Partial<Omit<User, 'id'>>) => {
    let currentUsers = getUsers();
    const userIndex = currentUsers.findIndex(u => u.id === id);
    if(userIndex > -1) {
        currentUsers[userIndex] = { ...currentUsers[userIndex], ...updates };
        saveUsers(currentUsers);
        return currentUsers[userIndex];
    }
    return null;
}

export const updateUserWithPhone = (id: string, phone: string) => {
    updateUser(id, { phone });
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
