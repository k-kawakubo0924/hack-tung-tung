import { User } from '../types';

const USERS_KEY = 'sakura_app_users';
const CURRENT_USER_KEY = 'sakura_app_current_user';

interface StoredUser extends User {
  password: string; // In a real app, this should be hashed!
}

export const authService = {
  // Sign Up
  signUp: (username: string, email: string, password: string): { success: boolean; user?: User; error?: string } => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];

    // Check if email or username already exists
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'このメールアドレスは既に登録されています。' };
    }
    if (users.some(u => u.username === username)) {
      return { success: false, error: 'このユーザー名は既に使用されています。' };
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after signup
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return { success: true, user: userWithoutPassword };
  },

  // Login
  login: (identifier: string, password: string): { success: boolean; user?: User; error?: string } => {
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];

    const user = users.find(u => (u.email === identifier || u.username === identifier) && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'ユーザー名（またはメールアドレス）かパスワードが間違っています。' };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get Current User
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};