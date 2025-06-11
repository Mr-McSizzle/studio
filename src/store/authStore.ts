
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSimulationStore } from './simulationStore';

// !!! THIS IS A MOCK USER DATABASE AND IS NOT SECURE !!!
// !!! FOR DEMONSTRATION PURPOSES ONLY !!!
const mockUsers: Record<string, { name: string; passwordSaltedHash: string }> = { // passwordSaltedHash is still plaintext for mock
  "founder@forgesim.ai": { name: "Demo Founder", passwordSaltedHash: "password123" }
};

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  login: (email: string, passwordAttempt: string) => boolean; // Returns true on success, false on failure
  logout: () => void;
  signUp: (name: string, email: string, passwordAttempt: string) => boolean; // Returns true on success
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userEmail: null,
      userName: null,
      login: (email, passwordAttempt) => {
        const user = mockUsers[email.toLowerCase()];
        if (user && user.passwordSaltedHash === passwordAttempt) { // Insecure direct password comparison
          set({ isAuthenticated: true, userEmail: email, userName: user.name });
          return true;
        }
        set({ isAuthenticated: false, userEmail: null, userName: null }); // Ensure logout state if failed
        return false;
      },
      logout: () => {
        localStorage.removeItem('simulation-storage'); 
        useSimulationStore.getState().resetSimulation(); 
        set({ isAuthenticated: false, userEmail: null, userName: null });
      },
      signUp: (name, email, passwordAttempt) => {
        const lcEmail = email.toLowerCase();
        if (mockUsers[lcEmail]) {
          console.warn(`Mock sign up attempt for existing email: ${email}`);
          return false; // User already exists in mock
        }
        // In a real app, password would be hashed here.
        mockUsers[lcEmail] = { name: name, passwordSaltedHash: passwordAttempt };
        console.log(`Mock sign up successful for: ${name}, ${email}. Password (insecurely stored): ${passwordAttempt}`);
        // For this mock, sign-up does not automatically log in. User proceeds to login.
        return true;
      },
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
      // onRehydrateStorage: () => (state) => { // To debug rehydration
      //   console.log("AuthStore rehydrated:", state);
      // }
    }
  )
);

// Function to add a default user if none exists (useful for testing)
// This is outside the store to be callable, but be careful with direct manipulation.
export const ensureDefaultUser = () => {
  const email = "founder@forgesim.ai";
  if (!mockUsers[email.toLowerCase()]) {
    mockUsers[email.toLowerCase()] = { name: "Demo Founder", passwordSaltedHash: "password123" };
    console.log("Default mock user created for testing.");
  }
};

// Call it once, e.g. in a layout or a global setup file if needed for easier testing.
// ensureDefaultUser(); // Or call from a relevant part of your app initialization if desired.

