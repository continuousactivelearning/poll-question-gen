import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { useAuthStore } from "./store/auth-store";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// -------------------- AUTH FUNCTIONS -------------------- //

export const loginWithGoogle = async (role: "student" | "teacher" = "student") => {
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  // Store token and role in Zustand
  const setAuthState = useAuthStore.getState();
  setAuthState.setToken(idToken);
  setAuthState.setUserRole?.(role); // optional chaining in case setUserRole doesn't exist

  return result;
};

export const loginWithEmail = async (
  email: string,
  password: string,
  role: "student" | "teacher" = "student"
) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken();

  // Store token and role in Zustand
  const setAuthState = useAuthStore.getState();
  setAuthState.setToken(idToken);
  setAuthState.setUserRole?.(role);

  return result;
};

export const createUserWithEmail = async (
  email: string,
  password: string,
  displayName?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName
    });
  }

  return userCredential;
};

export const logout = () => {
  signOut(auth);
  useAuthStore.getState().clearUser?.(); // safe call if function exists
};

export const analytics = getAnalytics(app);