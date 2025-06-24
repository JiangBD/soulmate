// src/app/api/uploadphoto/route.js

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads');
const JWT_SECRET = process.env.JWT_SECRET;

// Helper: verify Bearer token and extract user_id
function verifyToken(req) {
  const authHeader = req.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) throw new Error('Missing or malformed Authorization header');
  const token = match[1];
  const payload = jwt.verify(token, JWT_SECRET);
  if (!payload.user_id) throw new Error('Invalid token payload');
  return payload.user_id;
}

export async function GET(req) {
  try {
    const user_id = verifyToken(req);
    const userDir = path.join(UPLOAD_BASE, user_id);

    // Read all filenames (or empty array if folder doesn't exist)
    let files;
    try {
      files = await fs.readdir(userDir);
    } catch (e) {
      if (e.code === 'ENOENT') {
        files = [];
      } else {
        throw e;
      }
    }

    // Build photo objects
const photos = files
  .filter(filename => !filename.includes('avatar'))
  .map(filename => ({
    filename,
    url: `/uploads/${encodeURIComponent(user_id)}/${encodeURIComponent(filename)}`
  }));

    return NextResponse.json({ photos });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user_id = verifyToken(req);
    const formData = await req.formData();
    const file = formData.get('photo');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Determine extension
    const originalName = file.name;
    const ext = path.extname(originalName).slice(1) || 'bin';

    // Generate unique filename
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Ensure user folder exists
    const userDir = path.join(UPLOAD_BASE, user_id);
    await fs.mkdir(userDir, { recursive: true });

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fullPath = path.join(userDir, uniqueName);
    await fs.writeFile(fullPath, buffer);

    // Return new file info
    return NextResponse.json({
      filename: uniqueName,
      url: `/uploads/${encodeURIComponent(user_id)}/${encodeURIComponent(uniqueName)}`
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(req) {
  try {
    const user_id = verifyToken(req);
    const url = new URL(req.url);
    const filename = url.searchParams.get('filename');
    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_BASE, user_id, filename);
    try {
      await fs.unlink(filePath);
    } catch (e) {
      if (e.code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      throw e;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
