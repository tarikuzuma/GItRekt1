'use client';

import AppLayout from '../../components/AppLayout';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    location: '',
    school: '',
    github: '',
    skills: [] as string[],
    vibe: '',
    stats: {
      hackathons: 0,
      wins: 0,
      prizes: '0'
    },
    idealTeam: [] as { role: string; desc: string; }[]
  });

  // Load onboarding/sign-up data if it exists
  useEffect(() => {
    const savedProfile = localStorage.getItem('hackmatch_user_profile');
    if (savedProfile) {
      const data = JSON.parse(savedProfile);
      setProfile(prev => ({
        ...prev,
        name: data.name || prev.name,
        school: data.university || data.school || prev.school,
        role: data.role || prev.role,
        skills: (data.skills && data.skills.length > 0) ? data.skills : prev.skills,
        vibe: data.vibe || prev.vibe,
        bio: data.isFirstTime ? `First-time hacker from ${data.university || 'university'} ready to learn and build! Interested in ${data.interests?.join(', ') || 'tech'}. Preferred vibe: ${data.vibe || 'Collaborative'}.` : (data.bio || prev.bio)
      }));

      // Cloud Sync Check
      if (data.email) {
        fetch(`/api/user/profile?email=${data.email.toLowerCase()}`)
          .then(res => res.json())
          .then(cloudData => {
            if (cloudData && cloudData.name) {
              setProfile(prev => ({ ...prev, ...cloudData }));
            }
          })
          .catch(err => console.error('Cloud sync failed:', err));
      }
    }
  }, []);

  const [newSkill, setNewSkill] = useState('');

  const handleSave = async () => {
    setIsEditing(false);
    
    // Save to localStorage
    const savedProfile = localStorage.getItem('hackmatch_user_profile');
    if (savedProfile) {
      const data = JSON.parse(savedProfile);
      const updatedProfile = { ...data, ...profile };
      localStorage.setItem('hackmatch_user_profile', JSON.stringify(updatedProfile));

      // Sync to cloud
      if (updatedProfile.email) {
        try {
          await fetch('/api/user/profile', {
            method: 'POST',
            body: JSON.stringify(updatedProfile),
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          console.error('Profile cloud sync failed');
        }
      }
    }
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <AppLayout>
      <div className="px-sm md:px-margin max-w-container-max mx-auto pb-32 lg:pb-margin mt-16 lg:mt-0 pt-lg">
        {/* Profile Header / Editor */}
        <section className="glass-panel rounded-2xl p-md md:p-lg flex flex-col md:flex-row gap-lg items-start md:items-center relative overflow-hidden mb-gutter glow-active transition-all duration-500">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          
          {/* Avatar Section */}
          <div 
            className={`relative group z-10 flex-shrink-0 ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
          >
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-primary/30 bg-surface shadow-2xl relative flex items-center justify-center">
              {profile.image && !profile.image.includes('unsplash.com') ? (
                <img alt={profile.name} className="w-full h-full object-cover" src={profile.image}/>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary text-5xl md:text-7xl font-bold uppercase">
                  {profile.name.charAt(0)}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span className="material-symbols-outlined text-white mb-1">add_a_photo</span>
                  <p className="text-white text-[10px] font-bold">Upload Photo</p>
                </div>
              )}
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

          <div className="flex-1 z-10 w-full min-w-0">
            {isEditing ? (
              <div className="mb-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-[14px] font-bold text-on-surface-variant uppercase tracking-widest">Edit Profile</h3>
                  <button 
                    onClick={handleSave}
                    className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold text-[14px] flex items-center gap-2 hover:brightness-110 shadow-lg transition-all flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span> Save Changes
                  </button>
                </div>
                <div className="space-y-3">
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:border-primary/50 outline-none transition-all"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Full Name"
                  />
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg text-primary font-semibold focus:border-primary/50 outline-none transition-all"
                    value={profile.role}
                    onChange={(e) => setProfile({...profile, role: e.target.value})}
                    placeholder="Role (e.g. Frontend Dev)"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="w-full max-w-xl">
                  <h2 className="font-h1 text-h1 text-on-surface mb-1">{profile.name}</h2>
                  <p className="font-h3 text-h3 text-primary">{profile.role}</p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button 
                    onClick={() => alert('Profile link copied! Share your Pinoy tech journey. 🇵🇭')}
                    className="bg-gradient-to-r from-primary to-inverse-primary text-on-primary px-6 py-2 rounded-lg font-label-caps text-label-caps flex items-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">share</span> Share Profile
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="glass-panel px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    <span className="md:hidden lg:inline text-[13px] font-bold">Edit</span>
                  </button>
                </div>
              </div>
            )}

            {isEditing ? (
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-body-lg text-on-surface-variant focus:border-primary/50 outline-none min-h-[100px] mb-4"
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Tell your story..."
              />
            ) : (
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-6 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">location_on</span> 
                {isEditing ? (
                  <input 
                    className="bg-transparent border-b border-white/10 outline-none focus:border-primary px-1"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                  />
                ) : profile.location}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                {isEditing ? (
                  <input 
                    className="bg-transparent border-b border-white/10 outline-none focus:border-primary px-1"
                    value={profile.school}
                    onChange={(e) => setProfile({...profile, school: e.target.value})}
                  />
                ) : profile.school}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">link</span>
                {isEditing ? (
                  <input 
                    className="bg-transparent border-b border-white/10 outline-none focus:border-primary px-1"
                    value={profile.github}
                    onChange={(e) => setProfile({...profile, github: e.target.value})}
                  />
                ) : profile.github}
              </div>
            </div>
          </div>
        </section>

        {/* Grid Layout for Details */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
          {/* Left Column (Tech & Preferences) */}
          <div className="xl:col-span-1 flex flex-col gap-gutter">
            {/* Tech Stack Editor */}
            <section className="glass-panel rounded-2xl p-md">
              <h3 className="font-h3 text-h3 text-on-surface mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">code</span> Tech Stack
                </div>
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map(skill => (
                  <span key={skill} className="bg-primary-container/20 text-primary px-3 py-1.5 rounded-full font-label-caps text-label-caps border border-primary/20 flex items-center gap-2 group">
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkill(skill)} className="hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <form onSubmit={addSkill} className="flex gap-2">
                  <input 
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white focus:border-primary outline-none"
                  />
                  <button type="submit" className="bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30 transition-all">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </form>
              )}
            </section>

            {/* Team Preferences Editor */}
            <section className="glass-panel rounded-2xl p-md">
              <h3 className="font-h3 text-h3 text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">group</span> Ideal Team
              </h3>
              <ul className="space-y-4">
                {profile.idealTeam.map((pref, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary mt-1">
                      {idx === 0 ? 'design_services' : 'database'}
                    </span>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[13px] font-semibold text-white"
                            value={pref.role}
                            onChange={(e) => {
                              const newTeam = [...profile.idealTeam];
                              newTeam[idx].role = e.target.value;
                              setProfile({...profile, idealTeam: newTeam});
                            }}
                          />
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-on-surface-variant"
                            value={pref.desc}
                            onChange={(e) => {
                              const newTeam = [...profile.idealTeam];
                              newTeam[idx].desc = e.target.value;
                              setProfile({...profile, idealTeam: newTeam});
                            }}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-body-md text-body-md text-on-surface font-semibold">{pref.role}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{pref.desc}</p>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right Column (Achievements) */}
          <div className="xl:col-span-2 flex flex-col gap-gutter">
            <section className="glass-panel rounded-2xl p-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">emoji_events</span> Hackathon Stats
                </h3>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[12px] font-bold tracking-widest uppercase">Elite Rank</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/5 hover:border-primary/30 transition-all">
                  {isEditing ? (
                    <input 
                      type="number"
                      className="w-full bg-transparent text-center text-h1 text-white font-bold mb-1 outline-none"
                      value={profile.stats.hackathons}
                      onChange={(e) => setProfile({...profile, stats: {...profile.stats, hackathons: parseInt(e.target.value)}})}
                    />
                  ) : (
                    <p className="text-h1 text-white font-bold mb-1">{profile.stats.hackathons}</p>
                  )}
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Hackathons</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/5 hover:border-primary/30 transition-all">
                  {isEditing ? (
                    <input 
                      type="number"
                      className="w-full bg-transparent text-center text-h1 text-primary font-bold mb-1 outline-none"
                      value={profile.stats.wins}
                      onChange={(e) => setProfile({...profile, stats: {...profile.stats, wins: parseInt(e.target.value)}})}
                    />
                  ) : (
                    <p className="text-h1 text-primary font-bold mb-1">{profile.stats.wins}</p>
                  )}
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">First Place</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/5 hover:border-primary/30 transition-all">
                  {isEditing ? (
                    <input 
                      className="w-full bg-transparent text-center text-h1 text-white font-bold mb-1 outline-none"
                      value={profile.stats.prizes}
                      onChange={(e) => setProfile({...profile, stats: {...profile.stats, prizes: e.target.value}})}
                    />
                  ) : (
                    <p className="text-h1 text-white font-bold mb-1">{profile.stats.prizes}</p>
                  )}
                  <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Total Prizes</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
