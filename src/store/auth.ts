import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";

interface AppUser {
  uid: string;
  email: string;
  name: string;
  photoURL: string | null;
  plan: string;
}

interface AuthState {
  user: AppUser | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
  setHydrated: () => void;
}

function firebaseUserToAppUser(fbUser: FirebaseUser): AppUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email || "",
    name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
    photoURL: fbUser.photoURL,
    plan: "free",
  };
}

async function syncUserToBackend(fbUser: FirebaseUser) {
  try {
    const token = await fbUser.getIdToken();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    await fetch(`${API_BASE}/api/auth/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
      }),
    });
  } catch {
    console.warn("Backend sync failed - backend may not be running");
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      isHydrated: false,

      initAuth: () => {
        const auth = getFirebaseAuth();
        if (!auth) {
          set({ isLoading: false, isHydrated: true });
          return;
        }
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            set({
              user: firebaseUserToAppUser(firebaseUser),
              token,
              isLoading: false,
              isHydrated: true,
            });
          } else {
            set({ user: null, token: null, isLoading: false, isHydrated: true });
          }
        });
      },

      setHydrated: () => set({ isHydrated: true }),

      login: async (email: string, password: string) => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase not configured");
        set({ isLoading: true });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          await syncUserToBackend(result.user);
          const token = await result.user.getIdToken();
          set({
            user: firebaseUserToAppUser(result.user),
            token,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase not configured");
        set({ isLoading: true });
        try {
          const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          await updateProfile(result.user, { displayName: name });
          await syncUserToBackend(result.user);
          const token = await result.user.getIdToken();
          set({
            user: firebaseUserToAppUser(result.user),
            token,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase not configured");
        set({ isLoading: true });
        try {
          const provider = getGoogleProvider();
          const result = await signInWithPopup(auth, provider);
          await syncUserToBackend(result.user);
          const token = await result.user.getIdToken();
          set({
            user: firebaseUserToAppUser(result.user),
            token,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const auth = getFirebaseAuth();
        if (auth) await signOut(auth);
        set({ user: null, token: null });
      },
    }),
    {
      name: "quantara-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
