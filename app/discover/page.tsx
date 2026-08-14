'use client';

import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Link from 'next/link';

const HACKATHONS = [
  {
    id: 'manila-ai-2024',
    title: 'Manila AI Innovation Summit',
    date: 'Oct 25 - 27',
    location: 'BGC, Taguig / Virtual',
    prize: '₱500,000',
    description: 'Build the next generation of AI tools for the Philippine market. Focus on Taglish NLP, local logistics optimization, and educational tech for public schools.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    tags: ['LLMs', 'Python', 'Local Data'],
    featured: true,
    category: 'AI/ML'
  },
  {
    id: 'crypto-manila-2024',
    title: 'Crypto Manila Hack',
    date: 'Nov 12 - 15',
    location: 'Makati City',
    prize: '₱250,000',
    description: 'Developing decentralized financial solutions for the unbanked in the Philippines. Build on Web3 to enable seamless remittances and local micro-loans.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
    tags: ['Solidity', 'Web3', 'Remittance'],
    category: 'Web3',
    icon: 'currency_bitcoin'
  },
  {
    id: 'smart-cities-ph',
    title: 'Smart Cities PH Challenge',
    date: 'Nov 22 - 24',
    location: 'Cebu City',
    prize: '₱150,000',
    description: 'Design smart urban solutions for traffic management, waste reduction, and public safety in major Philippine metropolitan areas.',
    image: 'https://images.unsplash.com/photo-1558441339-8747d576216c?auto=format&fit=crop&q=80&w=800',
    tags: ['IoT', 'Data Science'],
    category: 'Design',
    icon: 'location_city'
  },
  {
    id: 'p-pop-game-dev',
    title: 'P-Pop Game Jam',
    date: 'Dec 15 - 18',
    location: 'Virtual',
    prize: '₱100,000',
    description: 'A 72-hour game jam focused on Filipino culture, music, and mythology. Create games that celebrate Pinoy pride and creativity.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    tags: ['Unity', 'Game Design'],
    category: 'Gaming',
    icon: 'sports_esports'
  },
  {
    id: 'agritech-ph',
    title: 'AgriTech Pilipinas',
    date: 'Jan 15 - 17',
    location: 'Davao City / Virtual',
    prize: '₱300,000',
    description: 'Solving agriculture challenges with technology. Help local farmers with yield prediction, supply chain transparency, and weather monitoring.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800',
    tags: ['Mobile App', 'IoT', 'Data'],
    category: 'Fintech',
    icon: 'agriculture'
  },
  {
    id: 'sari-sari-digitize',
    title: 'Sari-Sari Digitalize',
    date: 'Feb 05 - 07',
    location: 'Virtual',
    prize: '₱200,000',
    description: 'Empower local sari-sari stores with digital inventory management and cashless payment integrations.',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800',
    tags: ['Fintech', 'React Native'],
    category: 'Fintech',
    icon: 'storefront'
  }
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Web3', 'AI/ML', 'Fintech', 'Design', 'Gaming'];

  const filteredHackathons = HACKATHONS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="max-w-container-max mx-auto px-sm md:px-margin py-lg md:py-xl mt-16 lg:mt-0 pb-24">
        {/* Page Header & Search/Filter */}
        <div className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-[40px] font-bold text-white mb-2 tracking-tight">Upcoming Local Hackathons</h2>
              <p className="text-[16px] text-slate-400 font-medium">Discover elite engineering challenges and form your ultimate Pinoy squad.</p>
            </div>
          </div>
          
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-2 items-center bg-[#0a0a0c]/60 backdrop-blur-3xl border border-white/[0.05] rounded-[20px] p-2 shadow-2xl">
            <div className="flex-1 w-full relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input 
                className="w-full bg-transparent border-none text-white font-medium text-sm pl-12 py-3.5 focus:ring-0 placeholder:text-slate-600 outline-none" 
                placeholder="Search events, technologies, or locations..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-8 w-[1px] bg-white/[0.05] hidden md:block mx-2"></div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar px-2 md:px-0">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? 'bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6]' 
                      : 'bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? 'All Events' : cat}
                </button>
              ))}
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.05] text-white text-[12px] font-bold whitespace-nowrap hover:border-[#8b5cf6]/40 transition-all ml-auto">
                <span className="material-symbols-outlined text-[18px]">tune</span> Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bento Grid - Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((event) => (
            <article 
              key={event.id}
              className={`${event.featured ? 'md:col-span-2' : ''} relative group rounded-[24px] bg-[#0f0f12]/40 backdrop-blur-3xl border border-white/[0.05] overflow-hidden hover:border-[#8b5cf6]/30 transition-all duration-500 flex flex-col`}
            >
              <div className="relative h-48 w-full overflow-hidden shrink-0">
                <img alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={event.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] via-transparent to-transparent"></div>
                {event.featured && (
                  <div className="absolute top-4 right-4 bg-[#8b5cf6] text-white font-bold text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/10">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Featured
                  </div>
                )}
                {!event.featured && event.icon && (
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-[#1e1333] border border-[#8b5cf6]/20 flex items-center justify-center shadow-2xl">
                    <span className="material-symbols-outlined text-[#8b5cf6] text-[20px]">{event.icon}</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-1 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#8b5cf6] transition-colors duration-300">{event.title}</h3>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_month</span> {event.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">location_on</span> {event.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-[#8b5cf6]">{event.prize}</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Prize Pool</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-[#1e1333] text-[#8b5cf6] text-[11px] font-bold border border-[#8b5cf6]/10 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href="/swipe" className={`px-6 py-2 rounded-xl text-[12px] font-bold transition-all ${event.featured ? 'bg-[#8b5cf6] text-white shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:brightness-110' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}>
                    Join Team
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        {filteredHackathons.length === 0 && (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-slate-700 text-6xl mb-4">search_off</span>
            <p className="text-slate-500 font-medium">No hackathons found matching your criteria.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
