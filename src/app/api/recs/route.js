// File: src/app/api/recs/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import ngeohash from 'ngeohash';

import { existUserId, getUser } from '@/lib/inmemory';
import {
  getUserGeohash,
  updateUserGeohash,
  getUsersInSameCell,      
} from '@/lib/geohash';
import {
  getCurrentPrematch,
  advanceToNextMatch,
  possibleMatchesMap, getPossibleMatchesObject, createNewPossibleMatchesEntry
} from '@/lib/possiblematches';
import { areDatingPreferencesMatched } from '@/lib/datingpreferences';
import { cosineSimilarity, getFullViewpointContents } from '@/utils/cosinesimilarityworker';
import { use } from 'react';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';
const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads');

/** Haversine distance (in km) */
// function distanceKm(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }
/** Verify JWT from Authorization header */
function verifyTokenOrThrow(req) {
  const auth = req.headers.get('authorization') || '';
  const [, token] = auth.split(' ');
  if (!token) throw new Error('Missing token');
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error('verifyTokenOrThrow: Invalid token');
  }
  if (!payload.user_id || !existUserId(payload.user_id)) {
    throw new Error('verifyTokenOrThrow: Invalid user');
  }
  return payload.user_id;
}

/** Build single profile object (with photos & viewpoints) */
async function buildProfileObject(userId) {
  if (!existUserId(userId) || !userId)
     { const x = (!userId) ? 'userId is null' : "No such user"; console.log(`buildProfileObject line 56 ERROR!!! ${userId} ${x}`); return null; }
  const userObj = getUser(userId);
  if (!userObj) { console.log("buildProfileObject line 59 (userObj) ERROR!!!"); return null; }

  const birthYear = parseInt(userObj.date_of_birth.split('-')[0], 10);
  const age = new Date().getFullYear() - birthYear;

  const allVps = getFullViewpointContents(userId);
  const viewpoints = allVps;

  let photoFiles = [];
  try {
    const userDir = path.join(UPLOAD_BASE, userId);
    photoFiles = await fs.readdir(userDir);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    photoFiles = [];
  }
  const photos = photoFiles.filter(filename => !filename.includes('avatar')).map((fn) => ({
    filename: fn,
    url: `/uploads/${encodeURIComponent(userId)}/${encodeURIComponent(fn)}`,
  }));

  return {
    user_id: userId,
    full_name: userObj.full_name,
    age,
    self_intro: userObj.self_intro,
    viewpoints,
    photos,
  };
}

export async function GET(req) {
  try {
    // 1) Verify token
    const me = verifyTokenOrThrow(req);

    // 2) If no matches computed yet, build queue:
    createNewPossibleMatchesEntry(me);
    //console.log(`api/recs Line 144 is reached!`);
    // 3) Get current matchId    

    const matchId = getCurrentPrematch(me);
    if (!matchId) { advanceToNextMatch(me);      
      console.log("api/recs line 149 matchId is null, end = true");  return NextResponse.json({ end: true });
    }

    // 4) Build and return that single profile
    const profile = await buildProfileObject(matchId);

    // 5) Advance to next match for subsequent calls
    
    
    advanceToNextMatch(me);
    console.log('api/recs line 159 Advanced to next prematch for user:', me);
    if (!profile) {
      return NextResponse.json({ error: 'Match missing' }, { status: 404 });      
    }
    console.log(` After api/recs Advanced to next match for user: ${me},
       preparing to return correctly and exit GET......`);
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
