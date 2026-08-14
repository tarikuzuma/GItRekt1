'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Client-side password strength validation (mirrors lib/password.ts requirements)
function validatePasswordClient(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) return 'Password must contain at least one special character (!@#$%^&* etc.)';
  return null;
}

// Password strength indicator
function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';
  const hasRequirements = validatePasswordClient(password) === null;
  if (hasRequirements && password.length >= 12) return 'strong';
  if (hasRequirements) return 'medium';
  return 'weak';
}

export default function WelcomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time password strength hint for signup
  const passwordError = !isLogin && password ? validatePasswordClient(password) : null;
  const passwordStrength = !isLogin && password ? getPasswordStrength(password) : 'weak';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      // Client-side validation before hitting the server
      const strengthError = validatePasswordClient(password);
      if (strengthError) {
        setError(strengthError);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Use NextAuth credentials sign-in
        const result = await signIn('credentials', {
          redirect: false,
          email: email.toLowerCase().trim(),
          password,
          rememberMe: rememberMe.toString(),
        });

        if (result?.error) {
          // Always show a generic error for security
          setError('Invalid email or password');
          setIsLoading(false);
          return;
        }

        if (result?.ok) {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        // SIGNUP: call our dedicated signup API
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
            name: fullName.trim(),
            university: university.trim(),
            course: course.trim(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Signup failed. Please try again.');
          setIsLoading(false);
          return;
        }

        // Auto-sign-in after successful registration
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: email.toLowerCase().trim(),
          password,
          rememberMe: 'false',
        });

        if (signInResult?.ok) {
          router.push('/onboarding');
          router.refresh();
        } else {
          setError('Account created! Please log in.');
          setIsLogin(true);
          setPassword('');
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
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
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] py-3 px-4 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">
                  Email Address
                </label>
                <input 
                  className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                  placeholder="name@university.edu.ph" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">
                  Password
                </label>
                <div className="relative">
                  <input 
                    className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10 pr-12" 
                    placeholder={isLogin ? 'Enter your password' : 'Min 8 chars, letters, numbers, special'}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#8b5cf6] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {/* Real-time password strength hint during signup */}
                {!isLogin && password && (
                  <div className="space-y-2">
                    {/* Strength indicator bar */}
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength === 'weak' ? 'bg-red-500' :
                        passwordStrength === 'medium' ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength === 'medium' || passwordStrength === 'strong' ? 
                        (passwordStrength === 'medium' ? 'bg-amber-500' : 'bg-green-500') :
                        'bg-white/10'
                      }`}></div>
                      <div className={`h-1 flex-1 rounded-full transition-all ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/10'
                      }`}></div>
                    </div>
                    
                    {/* Error or success message */}
                    {passwordError ? (
                      <p className="text-[12px] text-amber-400 ml-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        {passwordError}
                      </p>
                    ) : (
                      <p className="text-[12px] text-green-400 ml-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Password strength: <span className="font-bold capitalize">{passwordStrength}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Signup extra fields */}
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">
                      Full Name
                    </label>
                    <input 
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                      placeholder="e.g. Juan Dela Cruz" 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">
                        University
                      </label>
                      <input 
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                        placeholder="UP Diliman" 
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.15em] ml-1">
                        Course
                      </label>
                      <input 
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-5 py-4 text-white font-body-sm focus:border-[#8b5cf6]/40 focus:bg-black/60 outline-none transition-all placeholder:text-white/10" 
                        placeholder="BS CS" 
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Remember Me (login only) */}
              {isLogin && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={rememberMe}
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      rememberMe 
                        ? 'bg-[#8b5cf6] border-[#8b5cf6]' 
                        : 'border-white/20 bg-black/40 hover:border-[#8b5cf6]/50'
                    }`}
                  >
                    {rememberMe && (
                      <span className="material-symbols-outlined text-white text-[14px]">check</span>
                    )}
                  </button>
                  <label 
                    className="text-[13px] text-[#94a3b8] cursor-pointer select-none"
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    Remember me for 30 days
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#8b5cf6] text-white text-[14px] font-bold flex items-center justify-center hover:brightness-110 shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
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
                      setPassword('');
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
