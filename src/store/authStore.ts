
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSimulationStore } from './simulationStore'; // To call reset on logout

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  login: (email: string, name?: string) => void; // Name is optional, for signup flow
  logout: () => void;
  signUp: (name: string, email: string) => void; // Simplified, no password handling for mock
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userEmail: null,
      userName: null,
      login: (email, name) => {
        set({ isAuthenticated: true, userEmail: email, userName: name || email.split('@')[0] });
      },
      logout: () => {
        // Clear simulation store data from localStorage
        // Zustand's persist middleware for simulationStore uses a specific key.
        // We need to ensure this key is correct. Assuming it's 'simulation-storage' (default is store name).
        // A more robust way would be for simulationStore to export its clear function.
        localStorage.removeItem('simulation-storage'); // Manually remove item for simulationStore
        useSimulationStore.getState().resetSimulation(); // Also reset in-memory state for immediate effect


        set({ isAuthenticated: false, userEmail: null, userName: null });
      },
      signUp: (name, email) => {
        // In a real app, this would hit a backend. Here, we just log and prepare for login.
        console.log(`Mock sign up for: ${name}, ${email}`);
        // For this mock, we don't automatically log them in. They'll go to login page.
        // If auto-login after signup is desired, call:
        // set({ isAuthenticated: true, userEmail: email, userName: name });
      },
    }),
    {
      name: 'auth-storage', // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
