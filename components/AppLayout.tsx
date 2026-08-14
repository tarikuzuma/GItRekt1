'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matchNotification, setMatchNotification] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hackmatch_user_profile');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  // Global Real-time Listeners
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase.channel('global-notifications')
      .on('broadcast', { event: 'new-match' }, ({ payload }) => {
        const { users, names } = payload;
        if (users.includes(currentUser.id)) {
          // If the current user is part of the match, show the overlay
          setMatchNotification({
            name: names.find((n: string) => n !== currentUser.name) || 'A Hacker',
            // In a real app, we'd fetch the other user's image too
            image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, pathname]);

  const handleLogout = async () => {
    // Save to database before logging out
    const savedProfile = localStorage.getItem('hackmatch_user_profile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      if (profileData.email) {
        try {
          await fetch('/api/user/profile', {
            method: 'POST',
            body: JSON.stringify(profileData),
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          console.error('Failed to sync on logout');
        }
      }
    }
    localStorage.removeItem('hackmatch_user_profile');
    router.push('/');
  };

  return (
    <div className="bg-abyss text-on-surface font-body-md antialiased min-h-screen flex overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Ambient Illumination */}
      <div className="fixed inset-0 pointer-events-none z-0 radial-glow" style={{ background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 60%)' }}></div>
      
      {/* SideNavBar (Desktop) */}
      <nav className="hidden lg:flex flex-col h-screen p-sm fixed left-0 top-0 z-40 bg-surface/5 backdrop-blur-2xl border-r border-outline-variant/10 shadow-2xl w-64">
        <div className="flex items-center gap-xs mb-lg px-xs">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          <div>
            <h1 className="font-h3 text-h3 text-primary tracking-tighter">HackMatch</h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant">Engineering Elite</p>
          </div>
        </div>
        <div className="flex-1 space-y-xs">
          <Link href="/discover" className={`flex items-center gap-xs p-sm font-label-caps text-label-caps rounded-xl transition-all ${pathname === '/discover' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(208,188,255,0.3)] duration-200' : 'text-on-surface-variant hover:bg-white/5 hover:text-primary group'}`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={pathname === '/discover' ? { fontVariationSettings: "'FILL' 1" } : {}}>explore</span>
            <span>Discover</span>
          </Link>
          <Link href="/swipe" className={`flex items-center gap-xs p-sm font-label-caps text-label-caps rounded-xl transition-all ${pathname === '/swipe' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(208,188,255,0.3)] duration-200' : 'text-on-surface-variant hover:bg-white/5 hover:text-primary group'}`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={pathname === '/swipe' ? { fontVariationSettings: "'FILL' 1" } : {}}>groups</span>
            <span>Swipe</span>
          </Link>
          <Link href="/dashboard" className={`flex items-center gap-xs p-sm font-label-caps text-label-caps rounded-xl transition-all ${pathname === '/dashboard' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(208,188,255,0.3)] duration-200' : 'text-on-surface-variant hover:bg-white/5 hover:text-primary group'}`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={pathname === '/dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/messages" className={`flex items-center gap-xs p-sm font-label-caps text-label-caps rounded-xl transition-all ${pathname === '/messages' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(208,188,255,0.3)] duration-200' : 'text-on-surface-variant hover:bg-white/5 hover:text-primary group'}`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={pathname === '/messages' ? { fontVariationSettings: "'FILL' 1" } : {}}>chat</span>
            <span>Messages</span>
          </Link>
          <Link href="/profile" className={`flex items-center gap-xs p-sm font-label-caps text-label-caps rounded-xl transition-all ${pathname === '/profile' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(208,188,255,0.3)] duration-200' : 'text-on-surface-variant hover:bg-white/5 hover:text-primary group'}`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={pathname === '/profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person_outline</span>
            <span>Profile</span>
          </Link>
        </div>
        <div className="mt-auto space-y-xs">
          <Link href="/swipe" className="block w-full bg-gradient-to-br from-primary-fixed-dim to-primary-container text-on-primary-container font-label-caps text-label-caps py-sm rounded-xl mb-md transition-all hover:brightness-110 text-center">Start Swiping</Link>
          <Link href="/settings" className={`flex items-center gap-xs p-sm font-label-caps text-label-caps rounded-xl transition-all ${pathname === '/settings' ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(208,188,255,0.3)] duration-200' : 'text-on-surface-variant hover:bg-white/5 hover:text-primary'}`}>
            <span className="material-symbols-outlined" style={pathname === '/settings' ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
            <span>Settings</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-xs p-sm font-label-caps text-label-caps rounded-xl transition-all text-on-surface-variant hover:bg-error/10 hover:text-error w-full text-left group"
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 lg:ml-64 relative z-10 w-full pb-24 lg:pb-0">
        {/* TopNavBar (Mobile only) */}
        <header className="lg:hidden fixed top-0 w-full z-50 flex justify-between items-center px-margin py-xs max-w-container-max mx-auto bg-surface/10 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          <div className="text-h3 font-h3 font-bold text-primary">HackMatch</div>
          <div className="flex gap-sm">
            <button className="text-primary hover:text-primary-container transition-colors duration-300 scale-95 active:scale-90">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link href="/messages" className="text-primary hover:text-primary-container transition-colors duration-300 scale-95 active:scale-90">
              <span className="material-symbols-outlined">forum</span>
            </Link>
            <img alt="User profile photo" className="w-8 h-8 rounded-full border border-primary object-cover" src="https://images.unsplash.com/photo-1614289371518-722f2615943d?auto=format&fit=crop&q=80&w=100"/>
          </div>
        </header>
        
        {children}
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm pb-8 pt-xs bg-surface/20 backdrop-blur-lg border-t border-outline-variant/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-xl">
        <Link href="/discover" className={`flex flex-col items-center justify-center font-label-caps text-label-caps transition-all ${pathname === '/discover' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,188,255,0.6)] scale-110' : 'text-on-surface-variant hover:text-primary-container'}`}>
          <span className="material-symbols-outlined" style={pathname === '/discover' ? { fontVariationSettings: "'FILL' 1" } : {}}>search</span>
          <span>Explore</span>
        </Link>
        <Link href="/swipe" className={`flex flex-col items-center justify-center font-label-caps text-label-caps transition-all ${pathname === '/swipe' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,188,255,0.6)] scale-110' : 'text-on-surface-variant hover:text-primary-container'}`}>
          <span className="material-symbols-outlined" style={pathname === '/swipe' ? { fontVariationSettings: "'FILL' 1" } : {}}>style</span>
          <span>Match</span>
        </Link>
        <Link href="/dashboard" className={`flex flex-col items-center justify-center font-label-caps text-label-caps transition-all ${pathname === '/dashboard' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,188,255,0.6)] scale-110' : 'text-on-surface-variant hover:text-primary-container'}`}>
          <span className="material-symbols-outlined" style={pathname === '/dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>rocket_launch</span>
          <span>Teams</span>
        </Link>
        <Link href="/messages" className={`flex flex-col items-center justify-center font-label-caps text-label-caps transition-all ${pathname === '/messages' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,188,255,0.6)] scale-110' : 'text-on-surface-variant hover:text-primary-container'}`}>
          <span className="material-symbols-outlined" style={pathname === '/messages' ? { fontVariationSettings: "'FILL' 1" } : {}}>forum</span>
          <span>Chat</span>
        </Link>
        <Link href="/profile" className={`flex flex-col items-center justify-center font-label-caps text-label-caps transition-all ${pathname === '/profile' ? 'text-primary drop-shadow-[0_0_8px_rgba(208,188,255,0.6)] scale-110' : 'text-on-surface-variant hover:text-primary-container'}`}>
          <span className="material-symbols-outlined" style={pathname === '/profile' ? { fontVariationSettings: "'FILL' 1" } : {}}>person_outline</span>
          <span>Profile</span>
        </Link>
      </nav>

      {/* Real-time Match Overlay */}
      <AnimatePresence>
        {matchNotification && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="relative mb-12"
            >
              <div className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full"></div>
              <img 
                src={matchNotification.image} 
                alt={matchNotification.name} 
                className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-primary object-cover relative z-10 shadow-2xl"
              />
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-4 -right-4 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-20"
              >
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </motion.div>
            </motion.div>

            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4"
            >
              IT'S A MATCH!
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-lg md:text-xl mb-12 max-w-md"
            >
              You and <span className="text-white font-bold">{matchNotification.name}</span> have swiped right on each other. Build something epic together!
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col md:flex-row gap-4 w-full max-w-sm"
            >
              <button 
                onClick={() => {
                  router.push(`/messages?user=${encodeURIComponent(matchNotification.name)}`);
                  setMatchNotification(null);
                }}
                className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:brightness-110 shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all"
              >
                Send Message
              </button>
              <button 
                onClick={() => setMatchNotification(null)}
                className="flex-1 bg-white/5 text-white py-4 rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                Keep Swiping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
