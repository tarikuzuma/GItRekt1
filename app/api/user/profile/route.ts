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
    const { email, name, image, university, course, skills, interests } = data;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const fields = {
      name,
      image,
      university,
      course,
      // SQLite stores these as JSON strings — see lib/json-list.ts
      skills: serializeList(skills),
      interests: serializeList(interests),
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
