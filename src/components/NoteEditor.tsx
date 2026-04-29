import React, { useState, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Pin, Trash2, Tag, Lock, Unlock, Palette, Check, Type, Bold, Italic, List } from 'lucide-react';
import { db, type Note } from '../lib/db';
import { CryptoService } from '../lib/crypto';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface NoteEditorProps {
  noteId?: number;
  onBack: () => void;
  isPrivate?: boolean;
}

const COLORS = [
  'bg-surface',
  'bg-[#1C1C1E]',
  'bg-[#161618]',
];

export default function NoteEditor({ noteId, onBack, isPrivate: initialPrivate }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPrivate, setIsPrivate] = useState(initialPrivate || false);
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (noteId) {
      db.notes.get(noteId).then(note => {
        if (note) {
          setTitle(note.title);
          setIsPinned(note.isPinned);
          setIsPrivate(note.isPrivate);
          setCategory(note.category || 'General');
          setTags(note.tags);
          setColor(note.color && COLORS.includes(note.color) ? note.color : COLORS[0]);
          
          if (note.isPrivate) {
            setContent(CryptoService.decrypt(note.content));
          } else {
            setContent(note.content);
          }
        }
      });
    }
  }, [noteId]);

  const saveNote = async () => {
    if (!title && !content) {
      onBack();
      return;
    }

    const finalContent = isPrivate ? CryptoService.encrypt(content) : content;

    const noteData: any = {
      title,
      content: finalContent,
      category,
      isPinned,
      isPrivate: isPrivate ? 1 : 0,
      tags,
      color,
      updatedAt: Date.now(),
      createdAt: noteId ? 0 : Date.now()
    };

    if (noteId) {
      const existing = await db.notes.get(noteId);
      await db.notes.update(noteId, { ...noteData, createdAt: existing?.createdAt });
    } else {
      await db.notes.add(noteData as Note);
    }
    onBack();
  };

  const deleteNote = async () => {
    if (noteId) {
      await db.notes.delete(noteId);
    }
    onBack();
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const togglePrivate = () => {
    // If turning private, we'd ideally ask for the vault password here
    setIsPrivate(!isPrivate);
  };

  return (
    <div className={cn("h-full flex flex-col transition-colors duration-500", color)}>
      {/* Header */}
      <header className="p-4 pt-8 flex items-center justify-between">
        <button onClick={saveNote} className="p-2.5 rounded-full hover:bg-white/5 active:scale-95 bg-white/5 border border-white/10 transition-all">
          <ChevronLeft className="w-5 h-5 text-on-surface" />
        </button>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className={cn("p-2.5 rounded-full hover:bg-white/5 transition-colors", isPinned && "text-accent-gold")}
          >
            <Pin className={cn("w-5 h-5", isPinned && "fill-current rotate-45")} />
          </button>
          
          <button 
            onClick={togglePrivate}
            className={cn("p-2.5 rounded-full hover:bg-white/5 transition-colors", isPrivate && "text-accent-gold")}
          >
            {isPrivate ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2.5 rounded-full hover:bg-white/5"
          >
            <Palette className="w-5 h-5" />
          </button>

          {noteId && (
            <button onClick={deleteNote} className="p-2.5 rounded-full hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Color Picker Overlay */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 py-3 flex gap-3 overflow-x-auto bg-surface-variant/80 backdrop-blur-md border-y border-border-subtle no-scrollbar"
          >
            {COLORS.map(c => (
              <button 
                key={c}
                onClick={() => { setColor(c); setShowColorPicker(false); }}
                className={cn("w-8 h-8 rounded-full border border-white/10 shrink-0", c, color === c && "ring-2 ring-accent-gold ring-offset-2 ring-offset-surface")}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
        <input 
          type="text"
          placeholder="Title"
          className="text-3xl font-serif italic bg-transparent border-none outline-none placeholder:text-on-surface/10 text-on-surface leading-tight"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-wrap gap-1.5">
          {['Ideas', 'Work', 'Personal', 'General'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "text-[8px] px-2 py-1 rounded-sm uppercase font-black tracking-tighter border transition-all",
                category === cat 
                  ? "bg-on-surface text-surface border-on-surface"
                  : "bg-white/5 text-on-surface/20 border-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <span key={t} className="text-[9px] bg-accent-gold/10 text-accent-gold px-2.5 py-1 rounded-sm uppercase font-bold tracking-widest flex items-center gap-2 border border-accent-gold/20">
              {t}
              <Check className="w-3 h-3 cursor-pointer opacity-40 hover:opacity-100" onClick={() => removeTag(t)} />
            </span>
          ))}
          <input 
            type="text"
            placeholder="+ TAB TO ADD"
            className="text-[9px] bg-white/5 px-2.5 py-1 rounded-sm outline-none w-24 uppercase font-bold tracking-widest text-on-surface/30 focus:text-on-surface/80 transition-colors border border-dashed border-white/10"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={addTag}
          />
        </div>

        <textarea 
          placeholder="Begin your reflection..."
          className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed placeholder:text-on-surface/10 text-on-surface/80"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Rich Text Toolbar */}
      <div className="p-4 bg-surface/50 backdrop-blur-xl flex items-center gap-8 justify-center border-t border-border-subtle">
        <Bold className="w-5 h-5 text-on-surface opacity-20 hover:opacity-100 cursor-pointer transition-opacity" />
        <Italic className="w-5 h-5 text-on-surface opacity-20 hover:opacity-100 cursor-pointer transition-opacity" />
        <List className="w-5 h-5 text-on-surface opacity-20 hover:opacity-100 cursor-pointer transition-opacity" />
        <div className="w-1 h-5 bg-white/5 rounded-full"></div>
        <Type className="w-5 h-5 text-accent-gold" />
      </div>
    </div>
  );
}
