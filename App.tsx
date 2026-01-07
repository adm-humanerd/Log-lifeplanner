import React, { useState, useEffect } from 'react';
import { Settings } from './components/Settings';
import { Planner } from './components/Planner';
import { UserProfile } from './types';

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load user profile from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('log_user_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      // If no profile, force open settings
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('log_user_profile', JSON.stringify(profile));
    setIsSettingsOpen(false);
  };

  return (
    <div className="h-screen bg-paper text-ink selection:bg-stone-200 selection:text-ink font-sans overflow-hidden">
        {userProfile && userProfile.isSetupComplete ? (
          <Planner 
            user={userProfile} 
            openSettings={() => setIsSettingsOpen(true)} 
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
             <div className="text-center">
                <h1 className="font-serif text-6xl mb-4 text-ink tracking-tighter">Log.</h1>
                <p className="text-subtle mb-12 font-serif text-xl italic">"To every thing there is a season"</p>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="bg-ink text-paper px-8 py-4 rounded-full hover:scale-105 transition-transform uppercase text-xs tracking-widest font-medium shadow-lg"
                >
                  Initialize System
                </button>
             </div>
          </div>
        )}

        <Settings 
          currentProfile={userProfile}
          onSave={handleSaveProfile}
          isOpen={isSettingsOpen}
          onClose={() => userProfile?.isSetupComplete && setIsSettingsOpen(false)}
        />
    </div>
  );
}

export default App;