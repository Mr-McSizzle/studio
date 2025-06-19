
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useSimulationStore } from './simulationStore';
import { useAiMentorStore } from './aiMentorStore'; // Import AI Mentor store

// !!! THIS IS A MOCK USER DATABASE AND IS NOT SECURE !!!
// !!! FOR DEMONSTRATION PURPOSES ONLY !!!
const mockUsers: Record<string, { name: string; passwordSaltedHash: string }> = { // passwordSaltedHash is still plaintext for mock
  "founder@inceptico.ai": { name: "Demo Founder", passwordSaltedHash: "password123" }
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
        localStorage.removeItem('inceptico-simulation-storage'); 
        useSimulationStore.getState().resetSimulation(); 
        useAiMentorStore.getState().clearChatHistory(); // Clear chat history on logout
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
    }
  )
);

export const ensureDefaultUser = () => {
  const email = "founder@inceptico.ai";
  if (!mockUsers[email.toLowerCase()]) {
    mockUsers[email.toLowerCase()] = { name: "Demo Founder", passwordSaltedHash: "password123" };
    console.log("Default mock user created for testing.");
  }
};
    
