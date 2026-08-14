'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WelcomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate database check delay
    setTimeout(async () => {
      try {
        if (isLogin) {
          // LOGIN LOGIC: Check if user exists in database
          const res = await fetch(`/api/user/profile?email=${email.toLowerCase()}`);
          const data = await res.json();
          
          if (data && data.email) {
            localStorage.setItem('hackmatch_user_profile', JSON.stringify(data));
            router.push('/dashboard');
          } else {
            setError('Account not found. Mangyaring mag-Sign Up muna! 🇵🇭');
            setIsLoading(false);
          }
        } else {
          // SIGNUP LOGIC
          const newProfile = {
            name: fullName,
            university: university,
            course: course,
            email: email.toLowerCase(),
            interests: [],
            skills: [],
            role: '',
            isFirstTime: true
          };
          
          localStorage.setItem('hackmatch_user_profile', JSON.stringify(newProfile));
          
          // Sync to cloud immediately so friends can search for them
          await fetch('/api/user/profile', {
            method: 'POST',
            body: JSON.stringify(newProfile),
            headers: { 'Content-Type': 'application/json' }
          });

          router.push('/onboarding');
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Network error. Subukan uli mamaya.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="bg-[#000000] text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none z-0"></div>
      
      <main className="relative z-10 w-full max-w-[480px]">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white tracking-tighter mb-2">HackMatch</h1>
          <p className="text-[#94a3b8] uppercase tracking-[0.3em] text-[10px] font-bold">Engineering Elite • 🇵🇭</p>
        </div>

        <div className="glass-panel border border-white/[0.05] rounded-[32px] overflow-hidden shadow-2xl relative bg-[#0a0a0c]/80 backdrop-blur-3xl">
          <div className="p-8 md:p-10">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
              <p className="text-[#64748b] text-[14px]">
                {isLogin ? 'Sign in to find your next dream team.' : 'Join the elite community of Filipino student developers.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error/10 border border-error/20 text-error text-[13px] py-3 px-4 rounded-xl animate-pulse flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">Email Address</label>
                <input 
                  className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                  placeholder="name@university.edu.ph" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">Password</label>
                <div className="relative">
                  <input 
                    className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10 pr-12" 
                    placeholder="Enter your password" 
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#8b5cf6] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">Full Name</label>
                    <input 
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                      placeholder="e.g. Juan Dela Cruz" 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">University</label>
                      <input 
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                        placeholder="UP Diliman" 
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">Course</label>
                      <input 
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                        placeholder="BS CS" 
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#8b5cf6] text-white text-[14px] font-bold flex items-center justify-center hover:brightness-110 shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking...
                  </div>
                ) : (
                  isLogin ? 'Login' : 'Create Account'
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-[13px] text-[#64748b]">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="ml-2 text-[#8b5cf6] font-bold hover:underline transition-all"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>


            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
