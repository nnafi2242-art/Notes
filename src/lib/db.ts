import Dexie, { type Table } from 'dexie';

export interface Note {
  id?: number;
  title: string;
  content: string; 
  category: string;
  tags: string[];
  isPinned: boolean;
  isPrivate: number | boolean; 
  createdAt: number;
  updatedAt: number;
  color?: string;
}

export class DroidNotesDB extends Dexie {
  notes!: Table<Note>;

  constructor() {
    super('DroidNotesDB');
    this.version(2).stores({
      notes: '++id, title, category, isPinned, isPrivate, createdAt, *tags'
    });
  }
}

export const db = new DroidNotesDB();
