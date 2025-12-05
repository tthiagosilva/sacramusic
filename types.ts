export enum MassMoment {
  ENTRADA = "Entrada",
  ATO_PENITENCIAL = "Ato Penitencial",
  GLORIA = "Glória",
  SALMO = "Salmo",
  ACLIMACAO = "Aclamação",
  OFERTORIO = "Ofertório",
  SANTO = "Santo",
  CORDEIRO = "Cordeiro",
  COMUNHAO = "Comunhão",
  FINAL = "Final",
  POS_COMUNHAO = "Pós-Comunhão",
  OUTRO = "Outro"
}

export enum LiturgicalSeason {
  ADVENTO = "Advento",
  NATAL = "Natal",
  QUARESMA = "Quaresma",
  PASCOA = "Páscoa",
  TEMPO_COMUM = "Tempo Comum",
  MARIANO = "Mariano",
  FESTAS = "Festas/Solenidades"
}

export enum SetlistCategory {
  MISSA = "Missa",
  ADORACAO = "Adoração",
  APRESENTACAO = "Apresentação"
}

export type LiturgicalColor = 'green' | 'white' | 'red' | 'purple' | 'rose';

// --- AUTH & TENANCY TYPES ---

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currentMinistryId?: string; // The ministry the user is currently viewing
  ownedMinistries?: string[]; // IDs of ministries created by this user
}

export interface Ministry {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string; // e.g. "ABC-123"
  members: string[]; // List of User UIDs
  createdAt: string;
}

// --- DATA TYPES ---

export interface Song {
  id: string;
  title: string;
  key: string;
  moments: MassMoment[];
  seasons: LiturgicalSeason[];
  lyrics: string;
  chords: string;
  youtubeLink?: string;
  createdBy?: string; // User UID (for auditing) - Songs are GLOBAL
}

export interface CustomSetlistItem {
  uuid: string;
  songId: string;
}

export interface Setlist {
  id: string;
  ministryId: string; // PRIVATE to ministry
  name: string;
  date: string;
  category: SetlistCategory;
  type?: string;
  items: Record<string, string>; 
  customItems?: CustomSetlistItem[]; 
  notes?: string;
}

export interface Musician {
  id: string;
  ministryId: string; // PRIVATE to ministry
  name: string;
  instruments: string[];
  phone?: string;
}

export interface ScheduleAssignment {
  musicianId: string;
  role: string;
}

export interface ScheduleEntry {
  id: string;
  ministryId: string; // PRIVATE to ministry
  date: string;
  time: string;
  title: string;
  assignments: ScheduleAssignment[];
  setlistId?: string;
  liturgicalColor?: LiturgicalColor;
  notes?: string;
}