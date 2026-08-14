'use client';

import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Finalize Manila AI Summit PRD', category: 'Documentation', assignee: 'Angelo Reyes', completed: false },
    { id: 2, text: 'Refine Taglish NLP Data Pipeline', category: 'Backend', assignee: 'Unassigned', completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      text: 'New Hackathon Objective',
      category: 'General',
      assignee: 'Unassigned',
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <AppLayout>
      <div className="max-w-container-max mx-auto px-margin lg:px-margin pt-xl lg:pt-margin pb-xl min-h-screen flex flex-col gap-gutter">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-sm mt-16 lg:mt-0">
          <div>
            <h2 className="text-[40px] font-bold text-[#8b5cf6] tracking-tight">Team Bayanihan</h2>
            <p className="text-[16px] text-slate-400 font-medium mt-2">Managing Team 'Lodi Tech' for Manila AI Summit 2024</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => alert('Opening Team Settings...')}
              className="bg-white/5 border border-white/10 text-white font-bold text-[12px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all hover:bg-white/10"
            >
              Edit Team
            </button>
            <button 
              onClick={() => alert('Invite link copied to clipboard! 📋')}
              className="bg-[#8b5cf6] text-white font-bold text-[12px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all hover:brightness-110 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              Invite Member
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid (Bento Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Roster Section (Spans 8 cols) */}
          <div className="md:col-span-8 bg-[#0f0f12]/40 backdrop-blur-3xl border border-white/[0.05] rounded-[24px] p-8 flex flex-col gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/5 rounded-full blur-[80px] -z-10"></div>
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6]">groups</span> Active Roster
              </h3>
              <span className="bg-[#1e1333] text-[#8b5cf6] text-[12px] font-bold px-4 py-1.5 rounded-full border border-[#8b5cf6]/20">3/4 Members</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Member Card 1 */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer hover:border-[#8b5cf6]/40 hover:bg-white/[0.04] group">
                <img alt="Team Lead Avatar" className="w-14 h-14 rounded-full border-2 border-[#8b5cf6] object-cover" src="https://images.unsplash.com/photo-1614289371518-722f2615943d?auto=format&fit=crop&q=80&w=200"/>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-white">Angelo Reyes</h4>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Full Stack / AI</p>
                </div>
                <span className="material-symbols-outlined text-[#8b5cf6] bg-[#8b5cf6]/10 rounded-full p-1.5 text-[18px]">star</span>
              </div>
              {/* Member Card 2 */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer hover:border-[#8b5cf6]/40 hover:bg-white/[0.04] group">
                <img alt="Frontend Avatar" className="w-14 h-14 rounded-full border-2 border-white/10 object-cover" src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=200"/>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-white">Maria Santos</h4>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Product Designer</p>
                </div>
              </div>
              {/* Member Card 3 */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer hover:border-[#8b5cf6]/40 hover:bg-white/[0.04] group">
                <img alt="Backend Avatar" className="w-14 h-14 rounded-full border-2 border-white/10 object-cover" src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200"/>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-white">Kevin Panganiban</h4>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Backend Systems</p>
                </div>
              </div>
              {/* Missing Role Indicator */}
              <div className="bg-[#1e1333]/20 border border-dashed border-[#8b5cf6]/30 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#1e1333]/30 transition-all cursor-pointer group relative">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#8b5cf6]/30 flex items-center justify-center bg-black/40">
                  <span className="material-symbols-outlined text-[#8b5cf6] group-hover:scale-110 transition-transform">add</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-[#8b5cf6]/70 group-hover:text-[#8b5cf6] transition-colors">Missing Role</h4>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Mobile Developer</p>
                </div>
                <Link href="/swipe" className="bg-[#8b5cf6]/20 text-[#8b5cf6] text-[10px] font-bold px-3 py-1 rounded-lg border border-[#8b5cf6]/20 hover:bg-[#8b5cf6] hover:text-white transition-all">
                  Find
                </Link>
              </div>
            </div>
          </div>

          {/* Chemistry & Event Info (Spans 4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Team Chemistry Meter */}
            <div 
              onClick={() => alert('Analyzing team synergy... 🧠\nSolid foundation with Maria and Kevin! Current stack synergy is 82%.')}
              className="bg-[#0f0f12]/40 backdrop-blur-3xl border border-white/[0.05] rounded-[24px] p-8 flex flex-col items-center justify-center relative transition-all min-h-[260px] hover:border-[#8b5cf6]/30 cursor-pointer group"
            >
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] absolute top-8 left-8">Team Chemistry</h3>
              <div className="relative w-36 h-36 mt-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="absolute inset-0 rounded-full blur-[2px]" style={{ background: 'conic-gradient(from 180deg, #8b5cf6 0%, #dbb8ff 75%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 100%)' }}></div>
                <div className="absolute inset-1 rounded-full bg-[#0a0a0c] flex items-center justify-center flex-col z-10 border border-white/5">
                  <span className="text-3xl font-bold text-white leading-none">82<span className="text-sm opacity-50">%</span></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Team Synergy</span>
                </div>
              </div>
              <p className="text-xs font-medium text-center text-slate-500 mt-6 leading-relaxed">Solid tech stack. Need more localized design insights to reach 100%.</p>
            </div>

            {/* Event Details */}
            <Link href="/discover" className="bg-[#0f0f12]/40 backdrop-blur-3xl border border-[#8b5cf6]/20 rounded-[24px] p-8 flex flex-col gap-4 relative overflow-hidden group hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] transition-all cursor-pointer">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full blur-[40px] -z-10"></div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6]">rocket_launch</span> Manila AI Summit
              </h3>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</span>
                  <span className="text-[10px] font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full flex items-center gap-2 border border-[#8b5cf6]/20 uppercase tracking-widest hover:bg-[#8b5cf6]/20 transition-all"><span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse"></span> Open</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Starts In</span>
                  <span className="text-xs font-bold text-white tabular-nums tracking-widest">14d 08h 22m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prize Pool</span>
                  <span className="text-sm font-bold text-[#8b5cf6] tabular-nums tracking-widest">₱500,000</span>
                </div>
              </div>
              <div className="mt-2 text-[#8b5cf6] text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                View Event Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </Link>
          </div>

          {/* Shared Task List */}
          <div className="md:col-span-12 bg-[#0f0f12]/40 backdrop-blur-3xl border border-white/[0.05] rounded-[24px] p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6]">checklist</span> Objective Queue
              </h3>
              <button 
                onClick={addTask}
                className="text-[#8b5cf6] hover:text-white transition-all flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-[18px]">add_task</span> Add Task
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {tasks.map(task => (
                <div key={task.id} className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-all group ${task.completed ? 'opacity-50' : ''}`}>
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      task.completed ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' : 'border-[#8b5cf6]/30 text-transparent hover:bg-[#8b5cf6]/10'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <div className="flex-1">
                    <p className={`text-[14px] font-bold text-slate-200 ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/[0.03] px-3 py-1 rounded-full border border-white/[0.05]">{task.category}</span>
                    {task.assignee !== 'Unassigned' && (
                      <img alt="Assignee" className="w-8 h-8 rounded-full border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity" src="https://images.unsplash.com/photo-1614289371518-722f2615943d?auto=format&fit=crop&q=80&w=100"/>
                    )}
                    {task.assignee === 'Unassigned' && (
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-400/5 px-3 py-1 rounded-full border border-red-400/20 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">warning</span> Unassigned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
