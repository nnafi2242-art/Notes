import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StickyNote, Lock, Settings, Search, Plus, ThumbsUp, MoreVertical, Pin, Trash2, Tag, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Note } from './lib/db';
import { cn } from './lib/utils';
import { format } from 'date-fns';

// Screens
import NotesList from './components/NotesList';
import Vault from './components/Vault';
import AppSettings from './components/AppSettings';
import NoteEditor from './components/NoteEditor';

type Screen = 'notes' | 'vault' | 'settings' | 'editor';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('notes');
  const [editingNoteId, setEditingNoteId] = useState<number | undefined>(undefined);
  const [isLocked, setIsLocked] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Auto-lock logic
  useEffect(() => {
    let timeout: number;
    const handleActivity = () => {
      clearTimeout(timeout);
      // Auto-lock after 2 minutes of inactivity if we are in vault
      if (activeScreen === 'vault') {
        timeout = window.setTimeout(() => setIsLocked(true), 120000);
      }
    };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearTimeout(timeout);
    };
  }, [activeScreen]);

  const openEditor = (id?: number) => {
    setEditingNoteId(id);
    setActiveScreen('editor');
  };

  const closeEditor = () => {
    setActiveScreen('notes');
    setEditingNoteId(undefined);
  };

  return (
    <div className="flex flex-col h-full bg-surface text-on-surface">
      {/* Search Header (only on Notes screen) */}
      {activeScreen === 'notes' && (
        <header className="px-6 py-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-light tracking-tight text-on-surface">Reflections</h1>
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant border border-border-subtle hover:text-on-surface transition-colors">
              <Search className="w-5 h-5" />
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Ideas', 'Work'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                  filterCategory === cat 
                    ? "bg-on-surface text-surface border-on-surface" 
                    : "bg-surface-variant text-on-surface-variant border-border-subtle hover:border-on-surface-variant"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn("flex-1 overflow-y-auto pb-24 px-6", activeScreen !== 'notes' && "pt-8")}>
        <AnimatePresence mode="wait">
          {activeScreen === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <NotesList 
                searchQuery={searchQuery} 
                onNoteClick={openEditor} 
                filterCategory={filterCategory}
              />
            </motion.div>
          )}

          {activeScreen === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Vault 
                isLocked={isLocked} 
                setIsLocked={setIsLocked} 
                onNoteClick={openEditor}
              />
            </motion.div>
          )}

          {activeScreen === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AppSettings />
            </motion.div>
          )}

          {activeScreen === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-surface"
            >
              <NoteEditor 
                noteId={editingNoteId} 
                onBack={closeEditor} 
                isPrivate={editingNoteId === undefined && activeScreen === 'vault'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FAB - Material Floating Action Button */}
      {activeScreen !== 'editor' && !(activeScreen === 'vault' && isLocked) && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-28 right-8 w-14 h-14 bg-on-surface text-surface rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-30"
          onClick={() => openEditor()}
        >
          <Plus className="w-8 h-8 stroke-[2.5]" />
        </motion.button>
      )}

      {/* Navigation Bar */}
      {activeScreen !== 'editor' && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-surface/80 backdrop-blur-xl px-10 flex items-center justify-between border-t border-border-subtle z-40">
          <NavBtn 
            active={activeScreen === 'notes'} 
            onClick={() => setActiveScreen('notes')}
            icon={<StickyNote />}
            label="Notes"
          />
          <NavBtn 
            active={activeScreen === 'vault'} 
            onClick={() => setActiveScreen('vault')}
            icon={<Lock />}
            label="Vault"
          />
          <NavBtn 
            active={activeScreen === 'settings'} 
            onClick={() => setActiveScreen('settings')}
            icon={<Settings />}
            label="Settings"
          />
        </nav>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all outline-none",
        active ? "text-on-surface" : "text-on-surface/30"
      )}
    >
      <div className="transition-transform active:scale-90">
        {React.cloneElement(icon as React.ReactElement, { 
          className: cn("w-6 h-6", active && "fill-current") 
        })}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
