import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Note } from '../lib/db';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { Pin, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface NotesListProps {
  searchQuery: string;
  onNoteClick: (id: number) => void;
  isPrivate?: boolean;
  filterCategory?: string;
}

export default function NotesList({ searchQuery, onNoteClick, isPrivate = false, filterCategory = 'All' }: NotesListProps) {
  const notes = useLiveQuery(
    () => {
      let collection = db.notes
        .where('isPrivate')
        .equals(isPrivate ? 1 : 0);
      
      if (filterCategory !== 'All' && !isPrivate) {
        return collection
          .filter(note => note.category === filterCategory || note.tags.includes(filterCategory.toLowerCase()))
          .toArray();
      }

      if (searchQuery) {
        return collection
          .filter(note => 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .toArray();
      }
      
      return collection.reverse().sortBy('updatedAt');
    },
    [searchQuery, isPrivate, filterCategory]
  );

  if (!notes) return <div className="flex justify-center p-8">Loading...</div>;

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center opacity-40 gap-4 mt-20">
        <div className="w-20 h-20 rounded-full bg-on-surface/5 flex items-center justify-center">
          <Tag className="w-10 h-10" />
        </div>
        <div>
          <h3 className="font-medium">No notes yet</h3>
          <p className="text-sm">Tap the + button to start writing</p>
        </div>
      </div>
    );
  }

  // Group notes: Pinned and Others
  const pinnedNotes = notes.filter(n => n.isPinned);
  const otherNotes = notes.filter(n => !n.isPinned);

  return (
    <div className="space-y-6 mt-4">
      {pinnedNotes.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent-gold">Pinned</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onClick={() => onNoteClick(note.id!)} isPinnedSection />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="grid grid-cols-2 gap-4">
          {otherNotes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => onNoteClick(note.id!)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function NoteCard({ note, onClick, isPinnedSection }: { note: Note; onClick: () => void; key?: any; isPinnedSection?: boolean }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-5 rounded-3xl border border-border-subtle relative flex flex-col gap-2 transition-all cursor-pointer",
        isPinnedSection ? "bg-gradient-to-br from-[#1C1C1E] to-[#161618] shadow-lg" : "bg-surface-variant"
      )}
    >
      {note.isPinned && (
        <div className="absolute top-4 right-4 text-accent-gold">
          <Pin className="w-3.5 h-3.5 rotate-45 fill-current" />
        </div>
      )}
      
      <h4 className="font-serif text-lg text-on-surface line-clamp-1 pr-4 italic leading-tight">
        {note.title || "Untitled"}
      </h4>
      
      <p className="text-[11px] text-on-surface-variant line-clamp-3 leading-relaxed flex-1 mt-1">
        {note.content || "No content"}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1.5 overflow-hidden">
          {note.tags.slice(0, 1).map(tag => (
            <span key={tag} className="text-[8px] px-2 py-0.5 rounded bg-on-surface/5 text-on-surface-variant/60 uppercase font-black tracking-tighter">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-[9px] text-on-surface-variant/40 font-medium">
          {format(note.updatedAt, 'MMM d')}
        </span>
      </div>
    </motion.div>
  );
}
