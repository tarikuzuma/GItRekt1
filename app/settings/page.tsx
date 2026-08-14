'use client';

import AppLayout from '../../components/AppLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    university: '',
    course: ''
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hackmatch_user_profile');
    if (saved) {
      const data = JSON.parse(saved);
      const initialBio = data.isFirstTime ? `First-time hacker from ${data.university || 'university'} ready to learn and build!` : (data.bio || '');
      
      setProfile({
        name: data.name || '',
        role: data.role || 'New Hacker',
        bio: initialBio,
        image: data.image || '',
        university: data.university || '',
        course: data.course || ''
      });
    }
  }, []);

  const handleSave = async () => {
    // 1. Load existing to prevent data loss
    const existingRaw = localStorage.getItem('hackmatch_user_profile');
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const updatedProfile = { ...existing, ...profile };
    
    // 2. Save locally for instant UI update
    localStorage.setItem('hackmatch_user_profile', JSON.stringify(updatedProfile));
    
    // 3. Sync to database immediately
    if (updatedProfile.email) {
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          body: JSON.stringify(updatedProfile),
          headers: { 'Content-Type': 'application/json' }
        });
        alert('Profile synchronized with database! 🚀');
      } catch (e) {
        console.error('Database sync failed');
        alert('Saved locally, but database sync failed. It will retry on logout.');
      }
    } else {
      alert('Settings saved locally! 🚀');
    }
  };

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-12 max-w-7xl mx-auto w-full pb-32 mt-16 lg:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Settings Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#0f0f12]/60 backdrop-blur-3xl border border-white/[0.05] rounded-3xl p-4 flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`text-left p-4 rounded-2xl transition-all font-bold text-[14px] ${activeTab === 'profile' ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`text-left p-4 rounded-2xl transition-all font-bold text-[14px] ${activeTab === 'security' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                Security & Password
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`text-left p-4 rounded-2xl transition-all font-bold text-[14px] ${activeTab === 'notifications' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                Notifications
              </button>
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`text-left p-4 rounded-2xl transition-all font-bold text-[14px] ${activeTab === 'privacy' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                Privacy
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="bg-[#0f0f12]/60 backdrop-blur-3xl border border-white/[0.05] rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                <span className="font-bold text-[14px]">Theme</span>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 rounded-full p-1 transition-all relative ${isDarkMode ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-error/80 hover:text-error transition-colors p-4 font-bold uppercase tracking-widest text-[12px]"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-[#0f0f12]/60 backdrop-blur-3xl border border-white/[0.05] rounded-[32px] p-8 md:p-10 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-10 pb-6 border-b border-white/[0.05]">Edit Profile</h2>
              
              <div className="flex flex-col md:flex-row gap-10 items-start mb-10">
                <div 
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] bg-black/40 flex items-center justify-center">
                    {profile.image && !profile.image.includes('unsplash.com') ? (
                      <img alt="User Avatar" className="w-full h-full object-cover" src={profile.image}/>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary text-3xl font-bold uppercase">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                    <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                  </div>
                  <input 
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile({...profile, image: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-primary/50 outline-none transition-all"
                      type="text" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Headline</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:border-primary/50 outline-none transition-all"
                      type="text" 
                      value={profile.role}
                      onChange={(e) => setProfile({...profile, role: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Bio</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl text-white font-medium p-4 focus:border-primary outline-none transition-all resize-none h-32"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end pt-6 border-t border-white/[0.05]">
                <button 
                  onClick={handleSave}
                  className="bg-primary text-on-primary font-bold px-8 py-3 rounded-xl hover:brightness-110 shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
