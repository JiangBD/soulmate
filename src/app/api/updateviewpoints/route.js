// File: src/app/api/updateviewpoints/route.js

import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { existUserId } from '@/lib/inmemory';
import {
  getAllViewpointObjects,
  registerViewpoint,
  deleteViewpoint,
} from '@/utils/cosinesimilarityworker';

//
// Helper: extract and verify the JWT from Authorization header,
// then return user_id if valid, or throw an error.
//
function getUserIdFromToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
  const user_id = payload.user_id;
  if (!user_id) {
    throw new Error('Token payload missing user_id');
  }
  return user_id;
}

// ---------------------
// GET: return all viewpoints for this user
// ---------------------
export async function GET(request) {
  try {
    const user_id = getUserIdFromToken(request);
    if (!existUserId(user_id)) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // getAllViewpointObjects should return an array of { viewpoint_id, full_content }
    const allViewpoints = getAllViewpointObjects(user_id);
    return NextResponse.json({ viewpoints: allViewpoints }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 401 }
    );
  }
}

// ---------------------
// POST: add a new viewpoint; return { viewpoint_id, full_content }
// ---------------------
export async function POST(request) {
  try {
    const user_id = getUserIdFromToken(request);
    if (!existUserId(user_id)) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const full_viewpoint = body.full_viewpoint;
    if (!full_viewpoint || typeof full_viewpoint !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid full_viewpoint' },
        { status: 400 }
      );
    }

    // registerViewpoint returns a new viewpoint_id string (e.g. "abc123")
    const viewpoint_id = registerViewpoint(user_id, full_viewpoint);

    // Return both viewpoint_id and full_content so the client can render it immediately
    return NextResponse.json(
      { viewpoint_id, full_content: full_viewpoint },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 401 }
    );
  }
}

// ---------------------
// DELETE: delete a viewpoint by viewpoint_id
// ---------------------
export async function DELETE(request) {
  try {
    const user_id = getUserIdFromToken(request);
    if (!existUserId(user_id)) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const viewpoint_id = body.viewpoint_id;
    if (!viewpoint_id) {
      return NextResponse.json(
        { error: 'Missing viewpoint_id' },
        { status: 400 }
      );
    }

    const success = deleteViewpoint(user_id, viewpoint_id);
    if (!success) {
      console.log(`Failed to delete viewpoint, line 121`);
      return NextResponse.json(
        { error: 'Could not delete viewpoint' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.log(`${err.message}, line 133, ${new Date().toISOString()}`);
    return NextResponse.json(        
      { error: err.message },
      { status: 401 }
    );
  }
}
