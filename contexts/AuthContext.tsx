import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { getMinistryById, getUserProfile, saveUserProfile } from '../services/storage';
import { Ministry, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  currentMinistry: Ministry | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  selectMinistry: (ministryId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentMinistry, setCurrentMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setCurrentMinistry(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loadUserProfile = async (firebaseUser: User) => {
    try {
      let profile = await getUserProfile(firebaseUser.uid);
      
      // First time login? Create profile
      if (!profile) {
        profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        await saveUserProfile(profile);
      }

      setUserProfile(profile);

      // Load Ministry if selected
      if (profile.currentMinistryId) {
        const ministry = await getMinistryById(profile.currentMinistryId);
        setCurrentMinistry(ministry || null);
      } else {
        setCurrentMinistry(null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await loadUserProfile(user);
  };

  const signInWithGoogle = async () => {
    // We do NOT catch the error here anymore.
    // We let it propagate so the Login page can handle specific error codes (like unauthorized-domain)
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setCurrentMinistry(null);
  };

  const selectMinistry = async (ministryId: string) => {
      if (!user) return;
      const ministry = await getMinistryById(ministryId);
      if (ministry) {
          setCurrentMinistry(ministry);
          // Update profile to remember selection
          if (userProfile) {
              const updatedProfile = { ...userProfile, currentMinistryId: ministryId };
              setUserProfile(updatedProfile);
              await saveUserProfile(updatedProfile);
          }
      }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      currentMinistry, 
      loading, 
      signInWithGoogle, 
      signOut,
      refreshProfile,
      selectMinistry
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
