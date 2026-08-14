'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PROFILES = [
  {
    id: 1,
    name: 'Angelo Reyes',
    age: 22,
    role: 'Frontend Architect',
    school: 'BS Computer Science, UP Diliman',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    skills: ['React', 'Next.js', 'Tailwind'],
    bio: 'Building hyper-fast web apps for the local startup scene. Exploring modern UI/UX for Filipino-centric platforms. Looking for a backend lodi to build the next super-app.'
  },
  {
    id: 2,
    name: 'Maria Santos',
    age: 21,
    role: 'Product Designer',
    school: 'AB Interactive Design, DLSU',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    skills: ['Figma', 'Prototyping', 'User Research'],
    bio: 'Obsessed with accessibility in local gov apps. I turn complex problems into simple, beautiful interfaces. Seeking a team that values Pinoy-centric design.'
  },
  {
    id: 3,
    name: 'Kevin Panganiban',
    age: 23,
    role: 'Backend Developer',
    school: 'BS Information Tech, UST',
    image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=800',
    skills: ['Node.js', 'PostgreSQL', 'Golang'],
    bio: 'I scale systems for peak traffic during Shopee/Lazada sales. Expert in high-performance API design. Let’s build something for the massive local market!'
  },
  {
    id: 4,
    name: 'Bianca Dela Cruz',
    age: 20,
    role: 'AI/ML Researcher',
    school: 'Computer Science, ADMU',
    image: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=800',
    skills: ['Python', 'PyTorch', 'NLP'],
    bio: 'Developing NLP models for Taglish sentiment analysis. Looking to integrate generative AI into educational tools for public schools.'
  },
  {
    id: 5,
    name: 'Joshua Gomez',
    age: 22,
    role: 'Fullstack Developer',
    school: 'BS Software Dev, Mapua',
    image: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&q=80&w=800',
    skills: ['TypeScript', 'Supabase', 'GraphQL'],
    bio: 'The generalist you need. I ship features end-to-end and love building community-driven projects. Ready to grind for 48 hours in the next Manila hackathon!'
  },
  {
    id: 6,
    name: 'Isabella Ramos',
    age: 21,
    role: 'Cybersecurity Analyst',
    school: 'BS Computer Science, TIP Manila',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    skills: ['PenTesting', 'Linux', 'Ethical Hacking'],
    bio: 'Keeping local fintech platforms secure. I focus on vulnerability assessment and secure coding practices. Looking for a team that takes data privacy seriously.'
  },
  {
    id: 7,
    name: 'Nathaniel Go',
    age: 23,
    role: 'Mobile Developer',
    school: 'BS Information Tech, FEU Tech',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    skills: ['Flutter', 'Firebase', 'Dart'],
    bio: 'Specializing in cross-platform mobile apps for the masses. I built a local community pantry finder app. Ready to build the next essential Pinoy app.'
  },
  {
    id: 8,
    name: 'Sofia Abad',
    age: 20,
    role: 'Data Scientist',
    school: 'BS Statistics, UP Diliman',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
    skills: ['R', 'Tableau', 'Big Data'],
    bio: 'Turning local urban data into actionable insights. I love visualizing complex datasets about Manila traffic and public health. Data-driven and ready to hack.'
  },
  {
    id: 9,
    name: 'Rico Blanco',
    age: 22,
    role: 'Cloud Engineer',
    school: 'Computer Engineering, UST',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    bio: 'Deployment is my middle name. I ensure your app stays up even when 11.11 hits. Seeking a team with a solid product vision and high-performance requirements.'
  },
  {
    id: 10,
    name: 'Yumi Tanaka',
    age: 21,
    role: 'UX Researcher',
    school: 'Multimedia Arts, Mapua',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800',
    skills: ['User Testing', 'Personas', 'Journey Mapping'],
    bio: 'Bridging the gap between tech and the Pinoy user experience. I advocate for the user in every design decision. Let’s make tech that everyone can use.'
  },
  {
    id: 11,
    name: 'Paolo Lim',
    age: 22,
    role: 'Game Developer',
    school: 'BS Computer Science, Mapua',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    skills: ['Unity', 'C#', '3D Modeling'],
    bio: 'Creating games that highlight Filipino folklore. I love mixing modern mechanics with traditional stories. Looking for an artist to join my quest!'
  },
  {
    id: 12,
    name: 'Chloe Evangelista',
    age: 21,
    role: 'Web Developer',
    school: 'BS Information Tech, UST',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    skills: ['Vue.js', 'Firebase', 'Sass'],
    bio: 'Passionate about building clean and efficient websites. I specialize in frontend frameworks and love experimenting with new CSS techniques.'
  },
  {
    id: 13,
    name: 'Miguel Rodriguez',
    age: 23,
    role: 'IoT Engineer',
    school: 'BS Electronics Engineering, UP Diliman',
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=800',
    skills: ['Arduino', 'Raspberry Pi', 'C++'],
    bio: 'Solving local infrastructure problems with smart devices. I built a flood warning system for my barangay. Let’s make Manila smarter.'
  },
  {
    id: 14,
    name: 'Samantha Tan',
    age: 21,
    role: 'UI/UX Designer',
    school: 'BS Interactive Design, DLSU',
    image: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&q=80&w=800',
    skills: ['Adobe XD', 'Sketch', 'User Flows'],
    bio: 'Designing interfaces that feel like second nature. I focus on creating inclusive designs for the local market. Design is my language.'
  },
  {
    id: 15,
    name: 'Rafael Santos',
    age: 22,
    role: 'Blockchain Developer',
    school: 'BS Computer Science, ADMU',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    skills: ['Solidity', 'Ethereum', 'Web3.js'],
    bio: 'Exploring the future of finance in the Philippines. I build decentralized apps for transparent governance. Web3 enthusiast and builder.'
  },
  {
    id: 16,
    name: 'Julia Garcia',
    age: 20,
    role: 'Data Analyst',
    school: 'BS Statistics, UP Diliman',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    skills: ['SQL', 'Python', 'Excel'],
    bio: 'Extracting meaning from the noise. I love finding trends in local e-commerce data to help SMEs grow. Numbers tell a story, and I’m the narrator.'
  },
  {
    id: 17,
    name: 'Gabriel Mercado',
    age: 23,
    role: 'Backend Developer',
    school: 'BS Information Tech, FEU Tech',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    skills: ['Django', 'Redis', 'Docker'],
    bio: 'Building robust backends that can handle anything. I focus on security and scalability for local payment gateways. Code that works, every time.'
  },
  {
    id: 18,
    name: 'Andrea Lim',
    age: 21,
    role: 'Motion Designer',
    school: 'Multimedia Arts, Benilde',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
    skills: ['After Effects', 'Cinema 4D', 'Premiere'],
    bio: 'Bringing static designs to life with fluid motion. I create engaging content for local tech startups. Let’s add some movement to your project.'
  },
  {
    id: 19,
    name: 'Christian Reyes',
    age: 22,
    role: 'Software Engineer',
    school: 'BS Computer Science, PUP Manila',
    image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&q=80&w=800',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    bio: 'Determined to build impactful software for the public sector. I value efficiency and reliability. Ready to solve complex problems with code.'
  },
  {
    id: 20,
    name: 'Katrina Sy',
    age: 22,
    role: 'Product Manager',
    school: 'BS Business Management, UA&P',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
    skills: ['Agile', 'Scrum', 'Market Research'],
    bio: 'Bridging the gap between business goals and technical execution. I love defining product roadmaps for the local fintech scene. Vision-driven and organized.'
  },
  {
    id: 21,
    name: 'Marco Jose',
    age: 22,
    role: 'AI Engineer',
    school: 'BS Computer Science, Mapua',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    skills: ['TensorFlow', 'Keras', 'OpenCV'],
    bio: 'Developing computer vision models for local agriculture. I focus on automated crop monitoring and pest detection. AI for a better future.'
  },
  {
    id: 22,
    name: 'Leah Torres',
    age: 23,
    role: 'Cybersecurity Analyst',
    school: 'BS Information Tech, TIP Quezon City',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=800',
    skills: ['Wireshark', 'Metasploit', 'SOC'],
    bio: 'Defending local data from cyber threats. I specialize in network security and incident response. Always vigilant, always learning.'
  },
  {
    id: 23,
    name: 'Vince Dizon',
    age: 23,
    role: 'Robotics Engineer',
    school: 'BS Mechanical Engineering, DLSU',
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=800',
    skills: ['ROS', 'SolidWorks', 'Python'],
    bio: 'Building robots that assist in local disaster recovery. I love integrating hardware and software to solve physical challenges. Mechanical mind, digital heart.'
  },
  {
    id: 24,
    name: 'Nicole Pineda',
    age: 20,
    role: 'Social Media Manager',
    school: 'AB Communication, UST',
    image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=800',
    skills: ['Content Strategy', 'SEO', 'Copywriting'],
    bio: 'Amplifying the voice of local tech communities. I create content that resonates with the Pinoy audience. Storyteller and community builder.'
  },
  {
    id: 25,
    name: 'Justin Cruz',
    age: 22,
    role: 'Mobile Developer',
    school: 'BS Computer Science, UP Manila',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    skills: ['React Native', 'Swift', 'Kotlin'],
    bio: 'Building seamless mobile experiences for healthcare access. I focus on intuitive design and fast performance. Helping Pinoys get better care through tech.'
  },
  {
    id: 26,
    name: 'Patricia Lee',
    age: 21,
    role: 'Service Designer',
    school: 'AB Interdisciplinary Studies, ADMU',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    skills: ['Service Blueprints', 'Design Thinking', 'Workshops'],
    bio: 'Improving public services through human-centered design. I focus on creating seamless experiences for government processes. People-first approach.'
  },
  {
    id: 27,
    name: 'Enzo Morales',
    age: 23,
    role: 'Cloud Architect',
    school: 'BS Software Engineering, Mapua',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    skills: ['Azure', 'Terraform', 'CI/CD'],
    bio: 'Designing scalable cloud infrastructures for local startups. I focus on cost-optimization and high-availability. The cloud is the limit.'
  },
  {
    id: 28,
    name: 'Sarah Lopez',
    age: 22,
    role: 'Digital Illustrator',
    school: 'BFA Painting, UST',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    skills: ['Procreate', 'Photoshop', 'Concept Art'],
    bio: 'Visualizing Pinoy cyberpunk futures. I love creating immersive concept art for local game devs. Art that inspires and tells a story.'
  },
  {
    id: 29,
    name: 'Diego Ramos',
    age: 23,
    role: 'Fullstack Developer',
    school: 'BS Computer Science, DLSU',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    skills: ['Elixir', 'Phoenix', 'React'],
    bio: 'Passionate about building functional and real-time web applications. I focus on concurrent systems and clean code. Ready to build something big.'
  },
  {
    id: 30,
    name: 'Mikaela Hernandez',
    age: 22,
    role: 'Sustainable Tech Advocate',
    school: 'BS Environmental Science, UP Diliman',
    image: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&q=80&w=800',
    skills: ['Project Management', 'Sustainability', 'Policy'],
    bio: 'Driving the adoption of green technology in local industries. I focus on creating sustainable solutions for urban challenges. Tech for a greener tomorrow.'
  }
];

export default function SwipePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('hackmatch_user_profile');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  // Fetch real users from database and add to swipe pool
  useEffect(() => {
    const email = currentUser?.email;
    const url = email ? `/api/user/swipable?email=${email}` : '/api/user/swipable';
    
    fetch(url)
      .then(res => res.json())
      .then(realUsers => {
        if (Array.isArray(realUsers) && realUsers.length > 0) {
          setProfiles(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newUsers = realUsers
              .filter((u: any) => !existingIds.has(u.id))
              .map((u: any, idx: number) => ({
                id: u.id,
                name: u.name || 'Elite Hacker',
                age: 22, // Default age
                role: u.role || 'Full-Stack Developer',
                bio: u.bio || 'Building the future of PH tech.',
                image: u.image || `https://images.unsplash.com/photo-${1539571696357 + idx}-5a69c17a67c6?auto=format&fit=crop&q=80&w=400`,
                skills: (u.skills && u.skills.length > 0) ? u.skills : ['React', 'Next.js'],
                school: u.university || u.school || 'UP Diliman',
                isReal: true
              }));
            
            return [...newUsers, ...prev];
          });
        }
      })
      .catch(err => console.error('Failed to load real users:', err));
  }, [currentUser]);

  const currentProfile = profiles[currentIndex % profiles.length];

  const handleSwipe = async (dir: 'left' | 'right') => {
    setDirection(dir);
    
    // Call Swipe API if we have a current user and target
    if (currentUser?.email && currentProfile.isReal) {
      try {
        const res = await fetch('/api/swipe', {
          method: 'POST',
          body: JSON.stringify({
            actorEmail: currentUser.email,
            targetUserId: currentProfile.id,
            direction: dir === 'right' ? 'LIKE' : 'PASS',
            targetType: 'USER'
          }),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.isMatch) {
          handleMatch();
          return;
        }
      } catch (err) {
        console.error('Swipe API failed:', err);
      }
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 400);
  };

  const handleMatch = () => {
    const skillsParam = encodeURIComponent(currentProfile.skills.join(','));
    router.push(`/match?name=${encodeURIComponent(currentProfile.name)}&image=${encodeURIComponent(currentProfile.image)}&skills=${skillsParam}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentProfile, currentUser]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center p-sm md:p-margin relative h-full min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Swipe Container */}
        <div className="relative w-full max-w-[420px] aspect-[3/4] max-h-[819px] perspective-1000 mt-16 lg:mt-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
                rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
              }}
              exit={{ 
                x: direction === 'left' ? -800 : 800, 
                rotate: direction === 'left' ? -30 : 30,
                opacity: 0 
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) handleSwipe('right');
                else if (info.offset.x < -100) handleSwipe('left');
              }}
              className="absolute inset-0 glass-panel rounded-[24px] overflow-hidden flex flex-col glow-effect cursor-grab active:cursor-grabbing bg-surface-dim shadow-2xl"
            >
              {/* Image Section */}
              <div className="relative h-[55%] w-full pointer-events-none">
                <img alt={currentProfile.name} className="w-full h-full object-cover" src={currentProfile.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                {/* Top Badges */}
                <div className="absolute top-sm left-sm flex gap-2">
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-caps text-label-caps flex items-center gap-1 shadow-[0_0_15px_rgba(160,120,255,0.4)] border border-primary/20">
                    <span className="material-symbols-outlined text-[14px]">search</span>
                    Looking for Team
                  </span>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-md flex flex-col justify-end bg-gradient-to-t from-[#0a0a0c] to-transparent relative -mt-16 z-10 pointer-events-none">
                <div className="mb-xs">
                  <h2 className="font-h2 text-h2 text-white m-0 flex items-center gap-2">
                    {currentProfile.name}, {currentProfile.age}
                    <span className="material-symbols-outlined text-primary text-[20px]" title="Verified">verified</span>
                  </h2>
                  <p className="font-body-md text-body-md text-primary m-0 mt-1 font-bold">{currentProfile.role}</p>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-md opacity-80">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  <span>{currentProfile.school}</span>
                </div>
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-md">
                  {currentProfile.skills.map(skill => (
                    <span key={skill} className="bg-surface-container/50 text-primary border border-primary/20 px-3 py-1 rounded-full font-label-caps text-label-caps">
                      {skill}
                    </span>
                  ))}
                </div>
                {/* Bio */}
                <div className="font-body-sm text-body-sm text-on-surface-variant overflow-hidden pr-2 leading-relaxed opacity-80 line-clamp-3">
                  {currentProfile.bio}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Action Buttons */}
          <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-30">
            <button 
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error/50 hover:bg-error/10 transition-all duration-300 shadow-xl bg-surface/80 group"
            >
              <span className="material-symbols-outlined text-[32px] group-active:scale-90 transition-transform">close</span>
            </button>
            <button 
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-[#c4c1fb] hover:text-primary-container hover:border-primary-container/50 hover:bg-primary-container/10 transition-all duration-300 shadow-xl bg-surface/80 group -mt-4"
            >
              <span className="material-symbols-outlined text-[28px] group-active:scale-90 transition-transform">star</span>
            </button>
            <button 
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-container to-[#6d3bd7] flex items-center justify-center text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] hover:brightness-110 transition-all duration-300 group"
            >
              <span className="material-symbols-outlined text-[32px] group-active:scale-90 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </button>
          </div>
        </div>

        {/* Swipe Instructions (Desktop) */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-6 text-on-surface-variant opacity-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-outline-variant/30 flex items-center justify-center font-mono text-xs bg-surface/20">←</div>
            <span className="font-body-sm text-body-sm uppercase tracking-widest text-[11px] font-bold">Pass</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-outline-variant/30 flex items-center justify-center font-mono text-xs bg-surface/20">→</div>
            <span className="font-body-sm text-body-sm uppercase tracking-widest text-[11px] font-bold">Like</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-outline-variant/30 flex items-center justify-center font-mono text-xs bg-surface/20">↑</div>
            <span className="font-body-sm text-body-sm uppercase tracking-widest text-[11px] font-bold">Super</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
