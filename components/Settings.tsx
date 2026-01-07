import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Check } from 'lucide-react';

interface SettingsProps {
  currentProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentProfile, onSave, isOpen, onClose }) => {
  const [formData, setFormData] = useState<UserProfile>(
    currentProfile || {
      name: '',
      birthDate: '',
      birthTime: '',
      location: '',
      isSetupComplete: false,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, isSetupComplete: true });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/20 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-paper h-full shadow-2xl p-8 flex flex-col border-l border-stone-200">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-serif text-3xl text-ink">Calibration</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={24} className="text-subtle" />
          </button>
        </div>

        <p className="text-subtle mb-8 font-serif italic text-lg leading-relaxed">
          "To know the right timing is to know half of success. Tell us your origin coordinates."
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-subtle font-semibold">Name</label>
            <input
              required
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-stone-300 py-2 text-ink focus:outline-none focus:border-ink transition-colors font-serif text-xl"
              placeholder="How should we address you?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-subtle font-semibold">Date of Birth</label>
            <input
              required
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-stone-300 py-2 text-ink focus:outline-none focus:border-ink transition-colors font-serif text-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-subtle font-semibold">Time of Birth</label>
              <input
                required
                name="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-stone-300 py-2 text-ink focus:outline-none focus:border-ink transition-colors font-serif text-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-subtle font-semibold">Location</label>
              <input
                required
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-stone-300 py-2 text-ink focus:outline-none focus:border-ink transition-colors font-serif text-xl"
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="pt-10">
            <button
              type="submit"
              className="w-full bg-ink text-paper py-4 text-sm uppercase tracking-widest font-medium hover:bg-black transition-all flex items-center justify-center gap-2 group"
            >
              <span>Synchronize Rhythm</span>
              <Check size={16} className="group-hover:scale-110 transition-transform"/>
            </button>
          </div>
        </form>

        <div className="mt-auto pt-6 border-t border-stone-100">
          <p className="text-xs text-subtle text-center">
            Your data is processed locally to align the algorithm.
          </p>
        </div>
      </div>
    </div>
  );
};