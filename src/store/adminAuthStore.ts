import { create } from 'zustand';
import { ADMIN_PASSWORD } from '@/config/defaults';

interface AdminAuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAuthenticated: false,
  
  login: (password: string) => {
    const isValid = password === ADMIN_PASSWORD;
    if (isValid) {
      set({ isAuthenticated: true });
    }
    return isValid;
  },
  
  logout: () => {
    set({ isAuthenticated: false });
  },
}));
