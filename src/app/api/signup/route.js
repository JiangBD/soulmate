// src/app/api/signup/route.js
import { NextResponse } from 'next/server';
import { existUserId, addUser, dumpAll } from '@/lib/inmemory';
import { registerViewpoint, dumpAllViewpoints } from '@/utils/cosinesimilarityworker';
import { insertUser } from '@/utils/db';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    // 1) Parse the form-data
    const formData = await req.formData();

    // 2) Text fields
    const user_id        = formData.get('user_id');
    const full_name      = formData.get('full_name');
    const birthdate      = formData.get('birthdate');       // JSON string
    const gender         = formData.get('gender');
    const marital_status = formData.get('marital_status');
    const self_intro     = formData.get('self_intro');

    // 3) Viewpoints JSON
    const viewpointsRaw = formData.get('viewpoints');
    const viewpoints    = viewpointsRaw ? JSON.parse(viewpointsRaw) : [];

    // 4) Compute date_of_birth from birthdate JSON
    const dobObject = JSON.parse(birthdate);
    const year  = dobObject.year.padStart(4, '0');
    const month = dobObject.month.padStart(2, '0');
    const day   = dobObject.day.padStart(2, '0');
    const date_of_birth = `${year}-${month}-${day}`; // e.g., "1990-01-01"

    // 5) Add user & viewpoints to in-memory store
    const gender_preference           = formData.get('gender_preference');
    const marital_status_preference   = formData.get('marital_status_preference');
    const age_range                   = formData.get('age_range');  // e.g., "18 - 26"

    if (!existUserId(user_id)) {
      addUser({
        user_id,
        full_name,
        date_of_birth,
        gender,
        marital_status,
        self_intro,
        gender_preference,
        marital_status_preference,
        age_range,
      });
      // insertUser({
      //   user_id,
      //   full_name,
      //   date_of_birth,
      //   gender,
      //   marital_status,
      //   self_intro,
      //   gender_preference,
      //   marital_status_preference,
      //   age_range,
      // });
    } else {
      return NextResponse.json(
        { error: "Email/UserId exists!" },
        { status: 409 }
      );
    }

    for (const vp of viewpoints) {
      registerViewpoint(user_id, vp);
    }
    dumpAllViewpoints();
    // 6) PHOTOS HANDLING STARTS
    const photoFiles = formData.getAll('photos');  // array of File objects
    const uploadDir  = path.join(process.cwd(), 'public', 'uploads', user_id);

    // ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const savedPhotos = [];
    let avatarUrl = null;

    // iterate over each uploaded file
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];

      // read file into a buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // determine the file extension
      const originalName = file.name;
      const parts = originalName.split('.');
      const ext = parts[parts.length - 1];

      // create a unique filename for the photo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).slice(2);
      const filename = `${timestamp}-${randomString}.${ext}`;
      const fullPath = path.join(uploadDir, filename);

      // save the photo on disk
      await fs.writeFile(fullPath, buffer);

      // record the public URL for this photo
      const publicUrl = `/uploads/${user_id}/${filename}`;
      savedPhotos.push(publicUrl);

      // if this is the first photo, also create an "avatar.ext" copy
      if (i === 0) {
        const avatarFilename = `avatar.${ext}`;
        const avatarPath = path.join(uploadDir, avatarFilename);

        // write the same buffer as the avatar file
        await fs.writeFile(avatarPath, buffer);

        // record the public URL for the avatar
        avatarUrl = `/uploads/${user_id}/${avatarFilename}`;
      }
    }
    // 6) PHOTOS HANDLING ENDS

    // 7) Debug logging
    console.log(`Saved ${savedPhotos.length} photos for ${user_id}:`, savedPhotos);
    if (avatarUrl) {
      console.log(`Avatar saved for ${user_id}:`, avatarUrl);
    }
    console.log('=== INMEMORY STORE DUMP ===');
    console.dir(dumpAll(), { depth: null });
    console.log('===========================');

    // 8) Generate JWT token
    const token = jwt.sign(
      { user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 9) Respond
    return NextResponse.json({ success: true, token, photos: savedPhotos });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}
