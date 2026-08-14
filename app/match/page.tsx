'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MatchContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Maria';
  const image = searchParams.get('image') || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300';
  const skillsString = searchParams.get('skills') || 'TypeScript,Next.js,Taglish NLP';
  const skills = skillsString.split(',');

  return (
    <div className="bg-[#000000] text-on-surface antialiased min-h-screen flex items-center justify-center overflow-hidden relative font-body-md">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,rgba(0,0,0,0)_70%)] opacity-80"></div>
      </div>
      
      {/* Decorative Particles */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="absolute w-1 h-1 rounded-full bg-white/20 top-[20%] left-[20%]"></div>
        <div className="absolute w-1.5 h-1.5 rounded-full bg-[#8b5cf6]/30 top-[40%] right-[15%]"></div>
        <div className="absolute w-1 h-1 rounded-full bg-white/10 bottom-[30%] left-[25%]"></div>
      </div>
      
      {/* Match Container */}
      <main className="relative z-20 w-full max-w-[520px] px-margin">
        <div className="bg-[#0f0f12]/90 backdrop-blur-3xl rounded-[32px] p-10 flex flex-col items-center text-center shadow-2xl border border-white/[0.05] relative overflow-hidden">
          
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_100%)] pointer-events-none"></div>
          
          {/* Lightning Header */}
          <div className="relative z-10 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1e1333] text-[#8b5cf6] mb-6 border border-[#8b5cf6]/20">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
            </div>
            <h1 className="text-[40px] font-bold text-white mb-2 tracking-tight">It's a Match!</h1>
            <p className="text-[#94a3b8] text-[15px] font-medium opacity-80">You and {name} have exceptional synergy.</p>
          </div>
          
          {/* Avatars & Compatibility */}
          <div className="relative z-10 flex items-center justify-center w-full mb-10 mt-2">
            <div className="flex items-center gap-0">
              {/* User Avatar */}
              <div className="relative z-10">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#1e1e24] shadow-2xl bg-[#1e1e24]">
                  <img alt="Your profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300" />
                </div>
              </div>
              
              {/* Synergy Badge */}
              <div className="relative z-30 -mx-6 flex items-center justify-center">
                <div className="bg-[#1e1333]/90 backdrop-blur-md rounded-full px-4 py-2 border border-[#8b5cf6]/30 shadow-[0_0_20px_rgba(139,92,246,0.2)] flex items-center gap-2">
                  <span className="text-[15px] font-bold text-white">98%</span>
                  <span className="material-symbols-outlined text-[#8b5cf6] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>link</span>
                </div>
              </div>
              
              {/* Matched User Avatar */}
              <div className="relative z-20">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#1e1e24] shadow-2xl bg-[#1e1e24]">
                  <img alt={name} className="w-full h-full object-cover" src={image} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tech Stack Chips */}
          <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-10">
            {skills.map((skill, i) => (
              <span key={i} className="px-4 py-1.5 rounded-full bg-[#1e1333] text-[#8b5cf6] text-[12px] font-bold border border-[#8b5cf6]/20">
                {skill.trim()}
              </span>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col w-full gap-3">
            <Link href={`/messages?user=${encodeURIComponent(name)}`} className="w-full py-4 rounded-2xl bg-[#8b5cf6] text-white font-bold text-[15px] shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:brightness-110 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              Start Chat with {name}
            </Link>
            
            <Link href="/dashboard" className="w-full py-4 rounded-2xl bg-[#1e1e24]/80 text-[#94a3b8] font-bold text-[15px] border border-white/[0.05] hover:bg-[#25252b] hover:text-white hover:scale-[1.02] transition-all flex items-center justify-center">
              Join AgriTech PH Challenge
            </Link>
            
            <Link href="/swipe" className="text-[#64748b] font-bold text-[13px] uppercase tracking-widest mt-6 hover:text-white hover:scale-105 transition-all inline-block">
              Keep Swiping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MatchSuccessPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center text-white">Loading Match...</div>}>
      <MatchContent />
    </Suspense>
  );
}
