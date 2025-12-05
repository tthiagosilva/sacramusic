import { Song, Setlist, Musician, ScheduleEntry, Ministry, UserProfile } from '../types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';

// Collections
const SONGS_COLLECTION = 'sacramusic_songs';
const SETLISTS_COLLECTION = 'sacramusic_setlists';
const MUSICIANS_COLLECTION = 'sacramusic_musicians';
const SCHEDULES_COLLECTION = 'sacramusic_schedules';
const USERS_COLLECTION = 'sacramusic_users';
const MINISTRIES_COLLECTION = 'sacramusic_ministries';

// --- USER & MINISTRY MANAGEMENT ---

export const getUserProfile = async (uid: string): Promise<UserProfile | undefined> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : undefined;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return undefined;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile, { merge: true });
};

export const createMinistry = async (name: string, owner: UserProfile): Promise<Ministry> => {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newMinistryRef = doc(collection(db, MINISTRIES_COLLECTION));
  
  const ministry: Ministry = {
    id: newMinistryRef.id,
    name,
    ownerId: owner.uid,
    inviteCode,
    members: [owner.uid],
    createdAt: new Date().toISOString()
  };

  await setDoc(newMinistryRef, ministry);

  // Update user profile
  await updateDoc(doc(db, USERS_COLLECTION, owner.uid), {
    currentMinistryId: ministry.id,
    ownedMinistries: arrayUnion(ministry.id)
  });

  return ministry;
};

export const joinMinistryByCode = async (code: string, user: UserProfile): Promise<Ministry | null> => {
  const q = query(collection(db, MINISTRIES_COLLECTION), where("inviteCode", "==", code));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const ministryDoc = snapshot.docs[0];
  const ministry = { ...ministryDoc.data(), id: ministryDoc.id } as Ministry;

  // Add user to ministry members
  await updateDoc(doc(db, MINISTRIES_COLLECTION, ministry.id), {
    members: arrayUnion(user.uid)
  });

  // Update user profile
  await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
    currentMinistryId: ministry.id
  });

  return ministry;
};

export const getMinistryById = async (id: string): Promise<Ministry | undefined> => {
  const docRef = doc(db, MINISTRIES_COLLECTION, id);
  const snap = await getDoc(docRef);
  return snap.exists() ? ({...snap.data(), id: snap.id} as Ministry) : undefined;
}

export const getMinistryMembers = async (memberIds: string[]): Promise<UserProfile[]> => {
    try {
        const promises = memberIds.map(uid => getDoc(doc(db, USERS_COLLECTION, uid)));
        const snapshots = await Promise.all(promises);
        return snapshots
            .filter(snap => snap.exists())
            .map(snap => snap.data() as UserProfile);
    } catch (error) {
        console.error("Error fetching members", error);
        return [];
    }
}

export const removeMemberFromMinistry = async (ministryId: string, memberId: string): Promise<void> => {
    try {
        const batch = writeBatch(db);
        
        // Remove from Ministry array
        const ministryRef = doc(db, MINISTRIES_COLLECTION, ministryId);
        batch.update(ministryRef, {
            members: arrayRemove(memberId)
        });

        // Remove from User profile
        const userRef = doc(db, USERS_COLLECTION, memberId);
        batch.update(userRef, {
            currentMinistryId: null // or logic to switch to another if available, simpler is null
        });

        await batch.commit();
    } catch (error) {
        console.error("Error removing member", error);
        throw error;
    }
}


// --- SONGS (GLOBAL REPO) ---

export const getSongs = async (): Promise<Song[]> => {
  try {
    const snapshot = await getDocs(collection(db, SONGS_COLLECTION));
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Song))
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

export const getSongById = async (id: string): Promise<Song | undefined> => {
  try {
    const docRef = doc(db, SONGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Song) : undefined;
  } catch (error) {
    console.error("Error fetching song:", error);
    return undefined;
  }
};

export const saveSong = async (song: Song): Promise<void> => {
  try {
    await setDoc(doc(db, SONGS_COLLECTION, song.id), song);
  } catch (error) {
    console.error("Error saving song:", error);
  }
};

export const deleteSong = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SONGS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting song:", error);
  }
};

// --- SETLISTS (PRIVATE TO MINISTRY) ---

export const getSetlists = async (ministryId: string): Promise<Setlist[]> => {
  try {
    const q = query(collection(db, SETLISTS_COLLECTION), where("ministryId", "==", ministryId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Setlist));
  } catch (error) {
    console.error("Error fetching setlists:", error);
    return [];
  }
};

export const getSetlistById = async (id: string): Promise<Setlist | undefined> => {
  try {
    const docRef = doc(db, SETLISTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as Setlist) : undefined;
  } catch (error) {
    console.error("Error fetching setlist:", error);
    return undefined;
  }
};

export const saveSetlist = async (setlist: Setlist): Promise<void> => {
  try {
    await setDoc(doc(db, SETLISTS_COLLECTION, setlist.id), setlist);
  } catch (error) {
    console.error("Error saving setlist:", error);
  }
};

export const deleteSetlist = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SETLISTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting setlist:", error);
  }
};

// --- MUSICIANS (PRIVATE TO MINISTRY) ---

export const getMusicians = async (ministryId: string): Promise<Musician[]> => {
  try {
    const q = query(collection(db, MUSICIANS_COLLECTION), where("ministryId", "==", ministryId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Musician));
  } catch (error) {
    console.error("Error fetching musicians:", error);
    return [];
  }
};

export const saveMusician = async (musician: Musician): Promise<void> => {
  try {
    await setDoc(doc(db, MUSICIANS_COLLECTION, musician.id), musician);
  } catch (error) {
    console.error("Error saving musician:", error);
  }
};

export const deleteMusician = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, MUSICIANS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting musician:", error);
  }
};

// --- SCHEDULES (PRIVATE TO MINISTRY) ---

export const getSchedules = async (ministryId: string): Promise<ScheduleEntry[]> => {
  try {
    const q = query(collection(db, SCHEDULES_COLLECTION), where("ministryId", "==", ministryId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ScheduleEntry));
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }
};

export const getScheduleById = async (id: string): Promise<ScheduleEntry | undefined> => {
  try {
    const docRef = doc(db, SCHEDULES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ ...docSnap.data(), id: docSnap.id } as ScheduleEntry) : undefined;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return undefined;
  }
};

export const saveSchedule = async (schedule: ScheduleEntry): Promise<void> => {
  try {
    await setDoc(doc(db, SCHEDULES_COLLECTION, schedule.id), schedule);
  } catch (error) {
    console.error("Error saving schedule:", error);
  }
};

export const deleteSchedule = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SCHEDULES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting schedule:", error);
  }
};