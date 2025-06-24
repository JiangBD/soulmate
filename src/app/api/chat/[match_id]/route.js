// src/app/api/chat/[match_id]/route.js

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { existUserId } from '@/lib/inmemory';
import { hasMatch } from '@/lib/matches';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request, { params }) {
  try {
    // 1) Extract and decode the dynamic segment
    const rawMatchId = params.match_id; 
    if (!rawMatchId) {
      throw new Error('Missing match_id');
    }
    const match_id = decodeURIComponent(rawMatchId);

    // 2) Verify JWT from Authorization header
    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const user_id = payload.user_id;
    if (!user_id || !existUserId(user_id)) {
      return NextResponse.json({ error: 'Unknown user' }, { status: 403 });
    }

    // 3) Check that match_id is a confirmed match
    if (!hasMatch(match_id)) {
      return NextResponse.json({ error: 'No such match' }, { status: 404 });
    }

    // 4) Ensure the user is part of match_id
    if (!match_id.includes(user_id)) {
      return NextResponse.json({ error: 'Không phải cuộc trò chuyện của bạn' }, { status: 403 });
    }

    // 5) Derive the partner’s user ID
    const [a, b] = match_id.split('_');
    const partner = a === user_id ? b : a;

    return NextResponse.json({ ok: true, partner });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
