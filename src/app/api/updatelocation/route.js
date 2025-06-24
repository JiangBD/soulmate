
// File: src/app/api/updatelocation/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { existUserId } from '@/lib/inmemory';
import { updateUserGeohash, ReupdateUserGeohash } from '@/lib/geohash';

const SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { token, lat, lng, isTriggeredNotByLocationChange } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (err) {
      console.error('[API /updatelocation] Invalid token:', err.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user_id = decoded?.user_id;
    if (!user_id || !existUserId(user_id)) {
      return NextResponse.json({ error: 'Invalid or unknown user' }, { status: 403 });
    }
    if (isTriggeredNotByLocationChange) {
      // If this is a forced update, we don't need lat/lng
      try {
      ReupdateUserGeohash(user_id) ;
      console.log(`[API /updatelocation] Re-updated geohash for user ${user_id}`);
      }
      catch (err) {
        console.error('[API /updatelocation] Error re-updating geohash:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400 });
    }

    updateUserGeohash(user_id, parsedLat, parsedLng);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[API /updatelocation] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


