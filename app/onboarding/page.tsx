'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 1, title: 'Interests', icon: 'favorite' },
  { id: 2, title: 'Role', icon: 'psychology' },
  { id: 3, title: 'Skills', icon: 'code' },
  { id: 4, title: 'Vibe', icon: 'auto_awesome' }
];

const CATEGORIES = ['AI/ML', 'Web3 & Crypto', 'FinTech', 'Social Good', 'Cybersecurity', 'Gaming', 'HealthTech', 'EdTech'];
const ROLES = ['Frontend Dev', 'Backend Lodi', 'Full-Stack Architect', 'UI/UX Designer', 'Product Manager', 'Data Scientist'];
const SKILLS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Solidity', 'Figma', 'PostgreSQL'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState({
    interests: [] as string[],
    role: '',
    skills: [] as string[],
    vibe: '',
    isFirstTime: false
  });

  const toggleSelection = (category: 'interests' | 'skills', item: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else {
      // Merge selections with existing profile (Name, University, etc.)
      const savedProfile = localStorage.getItem('hackmatch_user_profile');
      let finalProfile: any = selections;
      
      if (savedProfile) {
        const existingData = JSON.parse(savedProfile);
        finalProfile = {
          ...existingData,
          ...selections,
          isFirstTime: false // Mark as completed
        };
      }

      localStorage.setItem('hackmatch_user_profile', JSON.stringify(finalProfile));
      
      // Also sync to cloud immediately
      if (finalProfile.email) {
        fetch('/api/user/profile', {
          method: 'POST',
          body: JSON.stringify({ email: finalProfile.email, profile: finalProfile }),
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.error('Onboarding cloud sync failed:', err));
      }

      router.push('/profile');
    }
  };

  return (
    <div className="bg-black min-h-screen text-white font-body-md flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter mb-2">HackMatch</h1>
          <p className="text-[#94a3b8] uppercase tracking-[0.2em] text-[10px] font-bold">Engineering Elite</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-16 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0"></div>
          {STEPS.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentStep >= step.id ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(139,92,246,0.5)]' : 'bg-[#1e1e24] text-[#64748b]'
                }`}
              >
                {currentStep > step.id ? (
                  <span className="material-symbols-outlined text-[20px]">check</span>
                ) : (
                  <span className="text-[14px] font-bold">{step.id}</span>
                )}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${currentStep >= step.id ? 'text-primary' : 'text-[#64748b]'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass-panel border border-white/[0.05] rounded-[32px] p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3">Hackathon Categories</h2>
                  <p className="text-[#94a3b8] text-[15px]">Select the types of projects and industries that interest you most.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleSelection('interests', cat)}
                      className={`px-6 py-2.5 rounded-full text-[13px] font-bold border transition-all ${
                        selections.interests.includes(cat)
                          ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                          : 'bg-white/5 border-white/10 text-[#94a3b8] hover:border-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[14px]">First-time Hacker?</p>
                    <p className="text-[12px] text-[#64748b]">Let us know if you're new to hackathons so we can match you with leaders.</p>
                  </div>
                  <button 
                    onClick={() => setSelections({...selections, isFirstTime: !selections.isFirstTime})}
                    className={`w-12 h-6 rounded-full transition-all relative ${selections.isFirstTime ? 'bg-primary' : 'bg-[#1e1e24]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${selections.isFirstTime ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3">Choose Your Role</h2>
                  <p className="text-[#94a3b8] text-[15px]">What is your primary focus during a hackathon?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelections({...selections, role})}
                      className={`p-6 rounded-2xl border text-left transition-all ${
                        selections.role === role
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white/5 border-white/10 text-[#94a3b8]'
                      }`}
                    >
                      <span className="material-symbols-outlined mb-2 block">
                        {role.includes('Designer') ? 'brush' : role.includes('Manager') ? 'leaderboard' : 'code'}
                      </span>
                      <p className="font-bold text-[14px]">{role}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3">Your Tech Stack</h2>
                  <p className="text-[#94a3b8] text-[15px]">Which technologies are you most comfortable using?</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {SKILLS.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSelection('skills', skill)}
                      className={`px-6 py-2.5 rounded-full text-[13px] font-bold border transition-all ${
                        selections.skills.includes(skill)
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-white/5 border-white/10 text-[#94a3b8]'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3">Team Vibe</h2>
                  <p className="text-[#94a3b8] text-[15px]">What kind of team environment do you prefer?</p>
                </div>
                <div className="space-y-4">
                  {['Competitive & High-Speed', 'Learning & Collaborative', 'Chill & Fun-Focused'].map(vibe => (
                    <button
                      key={vibe}
                      onClick={() => setSelections({...selections, vibe})}
                      className={`w-full p-6 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        selections.vibe === vibe
                          ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-primary/50'
                      }`}
                    >
                      <span className={`font-bold transition-colors ${selections.vibe === vibe ? 'text-primary' : 'text-white group-hover:text-primary'}`}>{vibe}</span>
                      <span className={`material-symbols-outlined transition-colors ${selections.vibe === vibe ? 'text-primary' : 'text-slate-500'}`}>
                        {selections.vibe === vibe ? 'check_circle' : 'chevron_right'}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex gap-4">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-8 py-4 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
              >
                Back
              </button>
            )}
            <button 
              onClick={nextStep}
              className="flex-1 py-4 rounded-full bg-primary text-on-primary font-bold hover:brightness-110 shadow-lg transition-all"
            >
              {currentStep === 4 ? 'Complete Profile' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
