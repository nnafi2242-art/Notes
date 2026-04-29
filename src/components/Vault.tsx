import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import NotesList from './NotesList';

interface VaultProps {
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  onNoteClick: (id: number) => void;
}

export default function Vault({ isLocked, setIsLocked, onNoteClick }: VaultProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  // Dynamic PIN from localStorage
  const getCorrectPin = () => localStorage.getItem('vault_pin') || '1234';

  const handleKeyPress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin === getCorrectPin()) {
        setTimeout(() => {
          setIsLocked(false);
          setPin('');
        }, 100);
      } else if (newPin.length === 4) {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  };

  const removeLast = () => {
    setPin(pin.slice(0, -1));
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1C1C1E] p-8 rounded-[48px] mb-12 flex flex-col items-center gap-4 border border-border-subtle shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-[#252528] flex items-center justify-center text-accent-gold shadow-inner border border-white/5">
            <Lock className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h2 className="font-serif text-2xl text-on-surface italic">Private Vault</h2>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold mt-1">Authentication Required</p>
          </div>
        </motion.div>

        {/* PIN Indicators */}
        <div className="flex gap-4 mb-14">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={cn(
                "w-3 h-3 rounded-full border border-border-subtle transition-all duration-300",
                pin.length >= i ? "bg-on-surface scale-125 border-on-surface" : "bg-transparent",
                error && "border-red-500 bg-red-500"
              )} 
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-10 gap-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <KeypadButton key={num} label={num.toString()} onClick={() => handleKeyPress(num.toString())} />
          ))}
          <button onClick={() => setShowPin(!showPin)} className="w-14 h-14 text-on-surface-variant/40 flex items-center justify-center hover:text-on-surface transition-colors">
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <KeypadButton label="0" onClick={() => handleKeyPress('0')} />
          <button onClick={removeLast} className="w-14 h-14 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 flex items-center justify-center hover:text-on-surface">
            Del
          </button>
        </div>

        {error && <p className="text-red-500 text-xs mt-10 font-bold uppercase tracking-tight">Incorrect Access Key</p>}
        
        <p className="mt-auto mb-10 text-[9px] text-on-surface-variant/30 uppercase tracking-[0.1em] px-8 text-center">
          Secure biometric-ready hardware encryption active
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex items-center justify-between mb-8 sticky top-0 bg-surface z-10 pt-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-border-subtle flex items-center justify-center text-accent-gold">
            <Unlock size={20} />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-on-surface italic">Vault</h2>
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] uppercase font-bold tracking-widest">Secure Storage</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsLocked(true)}
          className="text-[9px] uppercase font-bold tracking-widest bg-border-subtle px-4 py-2 rounded-full hover:bg-surface-variant transition-colors border border-white/5"
        >
          Secure
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <NotesList isPrivate={true} searchQuery="" onNoteClick={onNoteClick} />
      </div>
    </div>
  );
}

function KeypadButton({ label, onClick }: { label: string, onClick: () => void, key?: any }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-light hover:bg-[#1C1C1E] transition-all border border-transparent hover:border-border-subtle text-on-surface/80"
    >
      {label}
    </motion.button>
  );
}
