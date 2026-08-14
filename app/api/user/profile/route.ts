import prisma from "@/lib/prisma";
import { deserializeUser, serializeList } from "@/lib/json-list";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });
    return NextResponse.json(user ? deserializeUser(user) : {});
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      email,
      name,
      image,
      university,
      course,
      skills,
      interests,
      role,
      bio,
      location,
      github,
      vibe,
      idealTeam,
      stats,
    } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // The profile page nests the counters under `stats`; the DB stores them flat.
    const toInt = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : 0;
    };

    const fields = {
      name,
      image,
      university: university ?? data.school,
      course,
      role,
      bio,
      location,
      github,
      vibe,
      hackathons: toInt(stats?.hackathons),
      wins: toInt(stats?.wins),
      totalPrizes: String(stats?.prizes ?? '0'),
      // SQLite stores these as JSON strings — see lib/json-list.ts
      skills: serializeList(skills),
      interests: serializeList(interests),
      idealTeam: JSON.stringify(Array.isArray(idealTeam) ? idealTeam : []),
    };

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: fields,
      create: { email: email.toLowerCase(), ...fields },
    });

    return NextResponse.json(deserializeUser(user));
  } catch (error) {
    console.error('Save profile error:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
