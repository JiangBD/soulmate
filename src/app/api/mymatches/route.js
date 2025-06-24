// src/app/api/mymatches/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { existUserId, getUser } from '@/lib/inmemory';
import { getAllMatches } from '@/lib/matches';
import fs from "fs";
const HISTORY_FILE = "@/../chat-history.json";


const JWT_SECRET = process.env.JWT_SECRET;

const getLatestMessage = (user_id, partner_id) => {
let chatHistory = [];
try {
  chatHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
} catch {
  chatHistory = [];
}
let latMsg = {};
try {
if (chatHistory.length > 0) {

chatHistory.forEach( (msg) => {
if (msg.sender !== user_id && msg.recipient !== user_id  ) return;
if (msg.sender !== partner_id && msg.recipient !== partner_id ) return; // not my mess
if (Object.keys(latMsg).length === 0) { latMsg = msg;    return; }
if ( (new Date (latMsg.timestamp) - new Date (msg.timestamp) ) < 0 ) latMsg = msg; 
} );
}
}
catch (err) { console.error("getLatestMessage error:", err.message);}

return latMsg;


}


export async function GET(req) {
  try {
    // 1) Verify JWT
    const auth = req.headers.get('authorization') || '';
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

    // 2) Get all confirmed match IDs, then filter those containing user_id
    const all = getAllMatches(); // e.g. ["alice@x.com_bob@y.com", ...]
    const mine = all.filter((mid) => mid.includes(user_id));

    // 3) For each match_id, derive the partner’s email and full_name
    const result = mine.map((mid) => {
      const decoded = decodeURIComponent(mid);

      let partnerId = null; // *****************************************
      const partnerIdWith_ = decoded.replace(user_id, '')
      if (partnerIdWith_.startsWith('_')) partnerId = partnerIdWith_.substring(1); // Remove leading underscore
      else partnerId = partnerIdWith_.substring(0,partnerIdWith_.length - 1); // No trailing underscore
      // *****************************************
      
      const partnerUser = getUser(partnerId);
      const partnerName = partnerUser ? partnerUser.full_name : partnerId;



      return { match_id: mid, partner_name: partnerName, lastMsg: getLatestMessage(user_id,partnerId) };
    });

    return NextResponse.json({ matches: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

