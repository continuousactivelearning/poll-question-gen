import { auth, provider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { useAuthStore } from '../store/auth-store';
import { queryClient } from './client';

// Enhanced mapFirebaseUserToAppUser to properly handle MongoDB user creation
const mapFirebaseUserToAppUser = async (firebaseUser: FirebaseUser | null) => {
  if (!firebaseUser) return null;

  try {
    // Get token for backend API calls
    const token = await firebaseUser.getIdToken(true);
    useAuthStore.getState().setToken(token);

    // Fetch backend user info directly using fetch
    let backendUser = null;
    try {
      const res = await fetch(`http://localhost:3000/api/users/firebase/${firebaseUser.uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (res.ok) {
        backendUser = await res.json();
        console.log('Fetched existing backend user:', backendUser);
      } else if (res.status === 404) {
        console.log('User not found in backend, creating new user...');

        // Create user in backend MongoDB
        const createRes = await fetch(`http://localhost:3000/api/users/firebase/${firebaseUser.uid}/profile`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firebaseUID: firebaseUser.uid,
            firstName: firebaseUser.displayName?.split(' ')[0] || '',
            lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || '',
            role: 'teacher', // Default role
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }),
        });
        console.log(firebaseUser);
        if (!firebaseUser.uid) {
          console.error('Firebase user UID is missing!');
          throw new Error('Firebase UID missing, cannot create user');
        }

        if (createRes.ok) {
          backendUser = await createRes.json();
          console.log('Successfully created backend user:', backendUser);
        } else {
          const errorText = await createRes.text();
          console.error('Failed to create backend user:', errorText);
          throw new Error(`Failed to create user: ${errorText}`);
        }
      } else {
        const errorText = await res.text();
        console.error('Failed to fetch backend user:', errorText);
        throw new Error(`Failed to fetch user: ${errorText}`);
      }
    } catch (error) {
      console.error('Backend user operation failed:', error);
      throw error;
    }
    console.log('Backend user data:', backendUser?.roles[0]);
    // Map user with backend data - ensure all fields are properly mapped
    const mappedUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || backendUser?.email || '',
      name: firebaseUser.displayName ||
        (backendUser ? `${backendUser.firstName} ${backendUser.lastName}`.trim() : ''),
      role: backendUser?.roles || 'student',
      avatar: firebaseUser.photoURL || backendUser?.avatar || '',
      userId: backendUser?._id,
      firstName: backendUser?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
      lastName: backendUser?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      createdAt: backendUser?.createdAt,
      updatedAt: backendUser?.updatedAt
    };

    console.log('Mapped user data:', mappedUser);
    return mappedUser;
  } catch (error) {
    console.error('Error mapping Firebase user:', error);
    return null;
  }
};

// Initialize auth listener
export const initAuth = () => {
  const { setUser, clearUser } = useAuthStore.getState();

  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      try {
        const user = await mapFirebaseUserToAppUser(firebaseUser);
        if (user) {
          console.log('User authenticated and stored:', user);
          localStorage.setItem('isAuth', 'true');
          setUser(user);
        } else {
          console.error('Failed to map Firebase user to app user');
          clearUser();
        }
      } catch (error) {
        console.error('Error during auth state change:', error);
        clearUser();
      }
    } else {
      console.log('User signed out');
      clearUser();
    }
  });
};

// Login with Google in a popup
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = await mapFirebaseUserToAppUser(result.user);
    if (user) {
      useAuthStore.getState().setUser(user);
      console.log('Google login successful:', user);
    }
    return result;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// Login with email/password
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = await mapFirebaseUserToAppUser(result.user);
    if (user) {
      useAuthStore.getState().setUser(user);
      console.log('Email login successful:', user);
    }
    return result;
  } catch (error) {
    console.error('Email login error:', error);
    throw error;
  }
};

// Enhanced logout function
export function logout() {
  try {
    // Clear localStorage
    localStorage.removeItem('isAuth');
    localStorage.removeItem('firebase-auth-token');

    // Sign out from Firebase
    firebaseSignOut(auth).catch(err => console.error('Firebase logout error:', err));

    // Clear user from store
    useAuthStore.getState().clearUser();

    // Reset query client
    queryClient.clear();

    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Check if user is authenticated
export function checkAuth() {
  const token = localStorage.getItem('firebase-auth-token');
  const firebaseUser = auth.currentUser;
  const isAuth = localStorage.getItem('isAuth') === 'true';
  return !!token && !!firebaseUser && isAuth;
}

// Get current user profile
export async function getCurrentUserProfile() {
  const user = useAuthStore.getState().user;
  if (!user || !user.uid) return null;

  try {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) return null;

    const res = await fetch(`http://localhost:3000/api/users/firebase/${user.uid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (res.ok) {
      const backendUser = await res.json();
      return backendUser;
    } else {
      console.error('Failed to fetch user profile');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(profileData: {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
}) {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('No authenticated user');

  try {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) throw new Error('No authentication token');

    const res = await fetch(`http://localhost:3000/api/users/firebase/${user.uid}/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...profileData,
        updatedAt: new Date().toISOString()
      }),
    });

    if (res.ok) {
      const updatedUser = await res.json();
      // Update the store with new user data
      const mappedUser = await mapFirebaseUserToAppUser(auth.currentUser);
      if (mappedUser) {
        useAuthStore.getState().setUser(mappedUser);
      }
      return updatedUser;
    } else {
      const errorText = await res.text();
      throw new Error(`Failed to update profile: ${errorText}`);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// API-specific functions
export { useLogin, useUserByFirebaseUID } from './hooks';