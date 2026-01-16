
import { User, UploadedDocument, QuestionPaperAnalysis, StudyPlan } from '../types';

const KEYS = {
  USERS: 'aa_users',
  DOCUMENTS: 'aa_documents',
  ANALYSIS: 'aa_analysis',
  PLANS: 'aa_plans',
  CURRENT_USER: 'aa_current_user'
};

const get = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const save = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  users: {
    find: (email: string) => get<User>(KEYS.USERS).find(u => u.email === email),
    create: (user: Partial<User>) => {
      const users = get<User>(KEYS.USERS);
      const newUser = { ...user, id: Math.random().toString(36).substr(2, 9), createdAt: new Date() } as User;
      save(KEYS.USERS, [...users, newUser]);
      return newUser;
    }
  },
  documents: {
    findByUser: (userId: string) => get<UploadedDocument>(KEYS.DOCUMENTS).filter(d => d.userId === userId),
    findById: (id: string) => get<UploadedDocument>(KEYS.DOCUMENTS).find(d => d.id === id),
    create: (doc: Partial<UploadedDocument>) => {
      const docs = get<UploadedDocument>(KEYS.DOCUMENTS);
      const newDoc = { ...doc, id: Math.random().toString(36).substr(2, 9), uploadedAt: new Date().toISOString() } as UploadedDocument;
      save(KEYS.DOCUMENTS, [...docs, newDoc]);
      return newDoc;
    }
  },
  analysis: {
    findByDoc: (docId: string) => get<QuestionPaperAnalysis>(KEYS.ANALYSIS).find(a => a.documentId === docId),
    upsert: (analysis: Partial<QuestionPaperAnalysis>) => {
      const all = get<QuestionPaperAnalysis>(KEYS.ANALYSIS);
      const existingIdx = all.findIndex(a => a.documentId === analysis.documentId);
      const newAnalysis = { ...analysis, id: analysis.id || Math.random().toString(36).substr(2, 9) } as QuestionPaperAnalysis;
      if (existingIdx > -1) {
        all[existingIdx] = newAnalysis;
        save(KEYS.ANALYSIS, all);
      } else {
        save(KEYS.ANALYSIS, [...all, newAnalysis]);
      }
      return newAnalysis;
    }
  },
  plans: {
    findByUser: (userId: string) => get<StudyPlan>(KEYS.PLANS).filter(p => p.userId === userId),
    create: (plan: Partial<StudyPlan>) => {
      const all = get<StudyPlan>(KEYS.PLANS);
      const newPlan = { ...plan, id: Math.random().toString(36).substr(2, 9), lastModified: new Date().toISOString() } as StudyPlan;
      save(KEYS.PLANS, [...all, newPlan]);
      return newPlan;
    },
    update: (id: string, updates: Partial<StudyPlan>) => {
      const all = get<StudyPlan>(KEYS.PLANS);
      const idx = all.findIndex(p => p.id === id);
      if (idx > -1) {
        all[idx] = { ...all[idx], ...updates, lastModified: new Date().toISOString() };
        save(KEYS.PLANS, all);
        return all[idx];
      }
      return null;
    }
  },
  auth: {
    getCurrentUser: () => {
      const user = localStorage.getItem(KEYS.CURRENT_USER);
      return user ? JSON.parse(user) as User : null;
    },
    setCurrentUser: (user: User | null) => {
      if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      else localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }
};
