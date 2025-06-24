import { NextResponse } from 'next/server';
import { existUserId } from '@/lib/inmemory';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

export async function POST(request) {
  const { user_id, google_login } = await request.json();
  if (google_login ){
    // If this is a Google login, we assume the user_id is the Google email
      if (!user_id || !existUserId(user_id)) {  return NextResponse.json({ isNewGoogleUser: !existUserId(user_id) });   }

      return NextResponse.json({ token: null, isNewGoogleUser: !existUserId(user_id) });
  }
  
  if (!user_id || !existUserId(user_id)) {
    return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 });
  }

  const token = jwt.sign({ user_id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN // Token valid for 30 days
  });

  return NextResponse.json({ token });
}
