/**
 * Dummy data seeder — elite student profiles for the swipe feed.
 *
 *   npm run seed
 *
 * Idempotent: users are upserted by email and teams by name, so re-running
 * refreshes the data instead of duplicating it.
 *
 * Skill labels deliberately match the canonical spellings in lib/resume-tags.ts
 * so resume-extracted tags dedupe cleanly against seeded ones.
 */

import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

const USERS = [
  {
    email: 'althea.reyes@up.edu.ph',
    name: 'Althea Reyes',
    role: 'Full Stack Engineer',
    university: 'University of the Philippines Diliman',
    course: 'BS Computer Science',
    location: 'Quezon City',
    github: 'github.com/altheareyes',
    vibe: 'Ship fast, refactor later',
    bio: 'Third-year CS student who lives in the terminal. Built a jeepney route optimiser that got 3k users in Metro Manila. Looking for a designer who can keep up.',
    hackathons: 12,
    wins: 5,
    totalPrizes: '₱480,000',
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Docker', 'AWS'],
    interests: ['Civic Tech', 'Transportation', 'Developer Tools'],
    idealTeam: [
      { role: 'Product Designer', desc: 'Someone who can prototype in Figma overnight' },
      { role: 'ML Engineer', desc: 'To make the routing actually smart' },
    ],
  },
  {
    email: 'miguel.santos@dlsu.edu.ph',
    name: 'Miguel Santos',
    role: 'ML Engineer',
    university: 'De La Salle University',
    course: 'BS Computer Engineering',
    location: 'Makati',
    github: 'github.com/migsantos',
    vibe: 'Research-driven, ships anyway',
    bio: 'Computer vision nerd. Trained a flood-depth estimator on CCTV footage for Marikina. Two published papers, zero social life.',
    hackathons: 9,
    wins: 4,
    totalPrizes: '₱325,000',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Computer Vision', 'NumPy', 'FastAPI', 'Docker'],
    interests: ['Disaster Response', 'Computer Vision', 'Research'],
    idealTeam: [
      { role: 'Frontend Developer', desc: 'To make my models look like a product' },
      { role: 'Backend Engineer', desc: 'Someone who enjoys deployment more than I do' },
    ],
  },
  {
    email: 'bea.lim@ateneo.edu',
    name: 'Bea Lim',
    role: 'Product Designer',
    university: 'Ateneo de Manila University',
    course: 'BS Information Systems',
    location: 'Quezon City',
    github: 'github.com/bealim',
    vibe: 'Design systems or nothing',
    bio: 'I make things people actually want to use. Ex-design intern at a YC startup. I will fight you about spacing.',
    hackathons: 15,
    wins: 7,
    totalPrizes: '₱610,000',
    skills: ['Figma', 'UI/UX Design', 'React', 'Tailwind CSS', 'HTML', 'CSS', 'Blender'],
    interests: ['Design Systems', 'Fintech', 'Accessibility'],
    idealTeam: [
      { role: 'Full Stack Developer', desc: 'Someone who respects the mockup' },
      { role: 'Pitch Lead', desc: 'To sell it better than I can' },
    ],
  },
  {
    email: 'rafael.cruz@ust.edu.ph',
    name: 'Rafael Cruz',
    role: 'Backend Engineer',
    university: 'University of Santo Tomas',
    course: 'BS Computer Science',
    location: 'Manila',
    github: 'github.com/rafcruz',
    vibe: 'Boring tech, reliable systems',
    bio: 'I like databases more than people. Built the payments layer for a campus e-wallet handling ₱2M/month.',
    hackathons: 8,
    wins: 3,
    totalPrizes: '₱215,000',
    skills: ['Go', 'PostgreSQL', 'Redis', 'Kubernetes', 'Docker', 'REST APIs', 'Linux'],
    interests: ['Fintech', 'Distributed Systems', 'Payments'],
    idealTeam: [
      { role: 'Frontend Developer', desc: 'Anyone who wants to own the UI entirely' },
      { role: 'Product Designer', desc: 'To tell me what to build' },
    ],
  },
  {
    email: 'kiana.tan@mapua.edu.ph',
    name: 'Kiana Tan',
    role: 'Mobile Developer',
    university: 'Mapúa University',
    course: 'BS Software Engineering',
    location: 'Makati',
    github: 'github.com/kianatan',
    vibe: 'Mobile-first, always',
    bio: 'Flutter since first year. Shipped a barangay health records app used by 14 clinics in Cavite.',
    hackathons: 11,
    wins: 4,
    totalPrizes: '₱290,000',
    skills: ['Flutter', 'Dart', 'Firebase', 'Kotlin', 'Swift', 'React Native', 'Git'],
    interests: ['HealthTech', 'Mobile', 'Public Health'],
    idealTeam: [
      { role: 'Backend Engineer', desc: 'Someone to own the API while I own the app' },
      { role: 'Data Analyst', desc: 'To make sense of what we collect' },
    ],
  },
  {
    email: 'josh.mendoza@usc.edu.ph',
    name: 'Josh Mendoza',
    role: 'DevOps Engineer',
    university: 'University of San Carlos',
    course: 'BS Information Technology',
    location: 'Cebu City',
    github: 'github.com/joshmendoza',
    vibe: 'Automate everything',
    bio: 'If it runs twice, I script it. Maintains CI for three open-source PH projects. Cebu tech scene regular.',
    hackathons: 7,
    wins: 2,
    totalPrizes: '₱145,000',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Python', 'Git', 'GitHub', 'DevOps'],
    interests: ['Infrastructure', 'Open Source', 'Automation'],
    idealTeam: [
      { role: 'Full Stack Developer', desc: 'Someone who builds while I keep it running' },
      { role: 'Product Designer', desc: 'To make it presentable by demo day' },
    ],
  },
  {
    email: 'nadine.villanueva@feutech.edu.ph',
    name: 'Nadine Villanueva',
    role: 'Data Scientist',
    university: 'FEU Institute of Technology',
    course: 'BS Data Science',
    location: 'Manila',
    github: 'github.com/nadinev',
    vibe: 'Let the data decide',
    bio: 'Turned DOH open data into a dengue forecasting dashboard. Kaggle competitions expert tier.',
    hackathons: 10,
    wins: 4,
    totalPrizes: '₱355,000',
    skills: ['Python', 'pandas', 'scikit-learn', 'SQL', 'Data Science', 'NumPy', 'Machine Learning'],
    interests: ['Public Health', 'Data Visualization', 'Open Data'],
    idealTeam: [
      { role: 'Frontend Developer', desc: 'To build dashboards that do not look like Excel' },
      { role: 'Backend Engineer', desc: 'For pipelines that survive real traffic' },
    ],
  },
  {
    email: 'paolo.garcia@addu.edu.ph',
    name: 'Paolo Garcia',
    role: 'Security Engineer',
    university: 'Ateneo de Davao University',
    course: 'BS Computer Science',
    location: 'Davao City',
    github: 'github.com/paologarcia',
    vibe: 'Break it before they do',
    bio: 'CTF player, three-time national finalist. Found and disclosed two auth bugs in local govt portals.',
    hackathons: 6,
    wins: 3,
    totalPrizes: '₱190,000',
    skills: ['Cybersecurity', 'Python', 'Linux', 'C', 'Go', 'Docker', 'REST APIs'],
    interests: ['Security', 'CTF', 'Privacy'],
    idealTeam: [
      { role: 'Full Stack Developer', desc: 'Someone who wants their code reviewed properly' },
      { role: 'Product Designer', desc: 'Security UX is still UX' },
    ],
  },
  {
    email: 'trisha.dizon@up.edu.ph',
    name: 'Trisha Dizon',
    role: 'Frontend Engineer',
    university: 'University of the Philippines Los Baños',
    course: 'BS Computer Science',
    location: 'Laguna',
    github: 'github.com/trishadizon',
    vibe: 'Pixel-perfect and accessible',
    bio: 'Animation obsessive. Rebuilt our student council site and cut load time by 70%. Framer Motion apologist.',
    hackathons: 9,
    wins: 3,
    totalPrizes: '₱240,000',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'CSS', 'JavaScript', 'Figma'],
    interests: ['Web Performance', 'Accessibility', 'EdTech'],
    idealTeam: [
      { role: 'Backend Engineer', desc: 'Give me a clean API and I will do the rest' },
      { role: 'ML Engineer', desc: 'To add something genuinely smart' },
    ],
  },
  {
    email: 'enzo.bautista@ustp.edu.ph',
    name: 'Enzo Bautista',
    role: 'IoT / Embedded Engineer',
    university: 'USTP Cagayan de Oro',
    course: 'BS Electronics Engineering',
    location: 'Cagayan de Oro',
    github: 'github.com/enzobautista',
    vibe: 'Hardware is just software with consequences',
    bio: 'Built a solar-powered river level sensor network deployed in two CDO barangays. Soldering iron always warm.',
    hackathons: 8,
    wins: 2,
    totalPrizes: '₱165,000',
    skills: ['Arduino', 'Raspberry Pi', 'C++', 'Python', 'IoT', 'Embedded Systems', 'MQTT'],
    interests: ['IoT', 'Climate', 'Disaster Response'],
    idealTeam: [
      { role: 'Full Stack Developer', desc: 'To build the dashboard for my sensors' },
      { role: 'Data Scientist', desc: 'To find patterns in the readings' },
    ],
  },
];

const TEAMS = [
  {
    name: 'Bayanihan Builders',
    description: 'Civic tech for Philippine local government units. Two-time national finalists.',
    skillsNeeded: ['UI/UX Design', 'Flutter', 'Data Science'],
    leadEmail: 'althea.reyes@up.edu.ph',
    memberEmails: ['rafael.cruz@ust.edu.ph', 'bea.lim@ateneo.edu'],
  },
  {
    name: 'Tide Watch',
    description: 'Flood and river monitoring using cheap sensors plus computer vision.',
    skillsNeeded: ['React', 'DevOps', 'Machine Learning'],
    leadEmail: 'enzo.bautista@ustp.edu.ph',
    memberEmails: ['miguel.santos@dlsu.edu.ph', 'nadine.villanueva@feutech.edu.ph'],
  },
  {
    name: 'Sari Stack',
    description: 'Inventory and micro-lending tools for sari-sari stores.',
    skillsNeeded: ['Mobile Development', 'Backend', 'Product Designer'],
    leadEmail: 'kiana.tan@mapua.edu.ph',
    memberEmails: ['josh.mendoza@usc.edu.ph'],
  },
  {
    name: 'Null Pointers',
    description: 'Security-first team. We audit before we ship. Looking for a frontend dev.',
    skillsNeeded: ['React', 'TypeScript', 'UI/UX Design'],
    leadEmail: 'paolo.garcia@addu.edu.ph',
    memberEmails: ['trisha.dizon@up.edu.ph'],
  },
];

async function main() {
  console.log('Seeding users…');
  const byEmail = new Map();

  for (const u of USERS) {
    const fields = {
      name: u.name,
      role: u.role,
      university: u.university,
      course: u.course,
      location: u.location,
      github: u.github,
      vibe: u.vibe,
      bio: u.bio,
      hackathons: u.hackathons,
      wins: u.wins,
      totalPrizes: u.totalPrizes,
      // JSON columns — SQLite has no array type (see lib/json-list.ts)
      skills: JSON.stringify(u.skills),
      interests: JSON.stringify(u.interests),
      idealTeam: JSON.stringify(u.idealTeam),
    };

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: fields,
      create: { email: u.email, ...fields },
    });

    byEmail.set(u.email, user);
    console.log(`  ${u.name.padEnd(22)} ${u.skills.length} skills`);
  }

  console.log('\nSeeding teams…');
  for (const t of TEAMS) {
    const existing = await prisma.team.findFirst({ where: { name: t.name } });

    const team = existing
      ? await prisma.team.update({
          where: { id: existing.id },
          data: { description: t.description, skillsNeeded: JSON.stringify(t.skillsNeeded) },
        })
      : await prisma.team.create({
          data: {
            name: t.name,
            description: t.description,
            skillsNeeded: JSON.stringify(t.skillsNeeded),
          },
        });

    // Rebuild membership so re-seeding doesn't stack duplicates.
    await prisma.teamMember.deleteMany({ where: { teamId: team.id } });

    const lead = byEmail.get(t.leadEmail);
    if (lead) {
      await prisma.teamMember.create({
        data: { teamId: team.id, userId: lead.id, role: 'LEAD' },
      });
    }

    for (const email of t.memberEmails) {
      const member = byEmail.get(email);
      if (member) {
        await prisma.teamMember.create({
          data: { teamId: team.id, userId: member.id, role: 'MEMBER' },
        });
      }
    }

    console.log(`  ${t.name.padEnd(22)} ${t.memberEmails.length + 1} members`);
  }

  const totals = {
    users: await prisma.user.count(),
    teams: await prisma.team.count(),
    members: await prisma.teamMember.count(),
  };
  console.log(`\nDone. ${totals.users} users, ${totals.teams} teams, ${totals.members} memberships.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
