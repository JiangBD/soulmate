// src/app/api/prematch/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { recordLike } from '@/lib/prematch';
import { addMatch } from '@/lib/matches';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

export async function POST(req) {
  try {
    const { token, likedUserId } = await req.json();
    if (!token || !likedUserId) {
      return NextResponse.json({ error: 'Thiếu token hoặc likedUserId' }, { status: 400 });
    }

    // 1) Verify token
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }
    const myId = payload.user_id;

    // 2) Record “like”
    const { isMutualMatch, prematchId } = recordLike(myId, likedUserId);

    // 3) If mutual, add to matches
    if (isMutualMatch) {
      addMatch(prematchId);
      console.log(`[Prematch] User ${myId} and ${likedUserId} are now a match!`);
    }
    console.log(`[Prematch] User ${myId} liked user ${likedUserId}. Is mutual match: ${isMutualMatch}`);
    return NextResponse.json({ success: true, isMutualMatch });
  } catch (err) { console.error('[Prematch] line 35 Error in POST /api/prematch:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
