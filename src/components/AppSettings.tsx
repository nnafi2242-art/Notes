import React, { useState } from 'react';
import { 
  Moon, Sun, Shield, Database, Download, Upload, 
  Trash2, Bell, AppWindow, Fingerprint, ChevronRight,
  Info, Github, Coffee
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/db';
import { cn } from '../lib/utils';

export default function AppSettings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(localStorage.getItem('biometric_enabled') === 'true');

  const changePin = () => {
    const currentPin = localStorage.getItem('vault_pin') || '1234';
    const oldPin = prompt('Enter your current PIN:');
    if (oldPin !== currentPin) {
      alert('Incorrect PIN');
      return;
    }
    const newPin = prompt('Enter your new 4-digit PIN:');
    if (newPin && /^\d{4}$/.test(newPin)) {
      localStorage.setItem('vault_pin', newPin);
      alert('PIN changed successfully!');
    } else {
      alert('Invalid PIN. Must be 4 digits.');
    }
  };

  const toggleBiometric = () => {
    const newVal = !biometricEnabled;
    setBiometricEnabled(newVal);
    localStorage.setItem('biometric_enabled', String(newVal));
  };

  const exportData = async () => {
    const notes = await db.notes.toArray();
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `droidnotes_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearAllData = async () => {
    if (confirm('Are you absolutely sure? This will delete ALL notes including the vault.')) {
      await db.notes.clear();
      window.location.reload();
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (Array.isArray(data)) {
            // Check for valid structure
            for (const item of data) {
              const { id, ...noteWithoutId } = item;
              await db.notes.add(noteWithoutId);
            }
            alert('Restore successful!');
            window.location.reload();
          }
        } catch (err) {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-10 pt-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="font-serif text-4xl text-on-surface italic px-2">Settings</h2>
      </header>

      {/* Security Section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em] px-2">Security & Privacy</h3>
        <div className="bg-surface-variant/30 rounded-[32px] overflow-hidden border border-border-subtle">
          <SettingsItem 
            icon={<Shield className="text-on-surface/60" />} 
            label="App Lock" 
            sub={`PIN enabled (${localStorage.getItem('vault_pin') || '1234'})`} 
            onClick={changePin}
            action={<span className="text-[10px] font-bold text-accent-gold">CHANGE</span>}
          />
          <SettingsItem 
            icon={<Fingerprint className="text-on-surface/60" />} 
            label="Biometric Login" 
            sub="Touch ID secondary unlock" 
            onClick={toggleBiometric}
            action={<div className={cn("w-9 h-5 rounded-full relative border border-white/5 transition-colors", biometricEnabled ? "bg-accent-gold" : "bg-white/5")}>
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full transition-all", biometricEnabled ? "right-0.5 bg-on-secondary" : "left-0.5 bg-white/20")}></div>
            </div>}
          />
        </div>
      </section>

      {/* Customization Section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em] px-2">Aesthetic</h3>
        <div className="bg-surface-variant/30 rounded-[32px] overflow-hidden border border-border-subtle">
          <SettingsItem 
            icon={darkMode ? <Moon className="text-on-surface/60" /> : <Sun className="text-on-surface/60" />} 
            label="Dark Mode" 
            sub="OLED deep black" 
            onClick={() => setDarkMode(!darkMode)}
          />
          <SettingsItem 
            icon={<AppWindow className="text-on-surface/60" />} 
            label="Typography" 
            sub="Serif / Georgia Italic" 
            action={<ChevronRight size={16} className="opacity-20" />}
          />
          <SettingsItem 
            icon={<Bell className="text-on-surface/60" />} 
            label="Reflections" 
            sub="Daily mindfulness cues" 
            action={<div className={cn("w-9 h-5 rounded-full relative transition-colors border", notifications ? "bg-accent-gold border-accent-gold" : "bg-white/5 border-white/5")} onClick={() => setNotifications(!notifications)}>
              <div className={cn("absolute top-0.5 w-4 h-4 rounded-full transition-all", notifications ? "right-0.5 bg-on-secondary" : "left-0.5 bg-white/20")}></div>
            </div>}
          />
        </div>
      </section>

      {/* Backup & Data Section */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-accent-gold uppercase tracking-[0.2em] px-2">Data</h3>
        <div className="bg-surface-variant/30 rounded-[32px] overflow-hidden border border-border-subtle">
          <SettingsItem 
            icon={<Download className="text-on-surface/60" />} 
            label="Export Library" 
            sub="Archival JSON backup" 
            onClick={exportData}
          />
          <SettingsItem 
            icon={<Upload className="text-on-surface/60" />} 
            label="Import Library" 
            sub="Restore from file" 
            onClick={importData}
          />
          <SettingsItem 
            icon={<Trash2 className="text-red-500/60" />} 
            label="Purge All Data" 
            sub="Irreversible deletion" 
            onClick={clearAllData}
          />
        </div>
      </section>

      {/* About Section */}
      <section className="flex flex-col gap-4 text-center mt-6 pb-10">
        <p className="text-[8px] text-on-surface-variant/40 font-black tracking-[0.3em] uppercase">
          Sophisticated Reflections v1.0.4
        </p>
      </section>
    </div>
  );
}

function SettingsItem({ icon, label, sub, action, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  sub: string, 
  action?: React.ReactNode,
  onClick?: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left border-b border-white/5 last:border-0 outline-none group"
    >
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-active:scale-90">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-base italic text-on-surface leading-tight">{label}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 mt-0.5">{sub}</span>
        </div>
      </div>
      {action ? action : <ChevronRight size={16} className="opacity-10 group-hover:opacity-40 transition-opacity" />}
    </button>
  );
}

