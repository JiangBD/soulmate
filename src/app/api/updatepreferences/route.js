// src/app/api/updatepreferences/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {
  existUserId,
  getDatingPreferences,
  updatePreferences
} from '@/lib/inmemory';

function extractToken(req) {
  const auth = req.headers.get('authorization') || '';
  const [scheme, token] = auth.split(' ');
  return scheme === 'Bearer' ? token : null;
}

export async function GET(req) {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
    
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { user_id } = payload;
  if (!existUserId(user_id)) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const prefs = getDatingPreferences(user_id) || {};
  return NextResponse.json(prefs);
}

export async function POST(req) {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { user_id } = payload;
  if (!existUserId(user_id)) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { self_intro, gender_preference, marital_status_preference, age_range } =
    await req.json();

  updatePreferences(
    user_id,
    self_intro,
    gender_preference,
    marital_status_preference,
    age_range
  );
  return NextResponse.json({ status: 'ok' });
}
