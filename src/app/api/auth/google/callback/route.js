// src/app/api/auth/google/callback/route.js
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { existUserId } from '@/lib/inmemory.js'; // Ensure this import is correct based on your project structure
import jwt from 'jsonwebtoken';
export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  // If Google returned an error or the user denied consent:
  if (error || !code) {
    console.error('OAuth error or user denied access:', error || 'no-code');
    // Redirect back to a login page (or wherever you prefer) with an error query
    return NextResponse.redirect(`http://localhost:3000/login?error=access_denied`);
  }

  // Initialize the OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/google/callback'
  );

  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
  } catch (tokenError) {
    console.error('Line 27 callback route.js, Error exchanging code for tokens:', tokenError);
    // Redirect with a token-exchange-failed flag
    return NextResponse.redirect(`http://localhost:3000/login?error=token_exchange_failed`);
  }

  let email;
  try {
    // Fetch the user's profile information
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    email = data.email;
    if (!email ) {
      throw new Error('No email returned in userinfo');
    }
    else if (!existUserId(email)) {
      console.log('New Google user signing up, email: ' + email);
      const newUserSignup_response = NextResponse.redirect('http://localhost:3000/signup');
      newUserSignup_response.cookies.set('signup_email', email, { 
      httpOnly: false, 
      secure: false,  // Allow over HTTP for localhost, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',    
      path: '/',
      maxAge: 45   //60 * 60 * 24, 1 day - those seconds
  });      
      return newUserSignup_response;
    }
    else {
      console.log('Returning Google user signing in, email: ' + email);
      const returningUser_response = NextResponse.redirect('http://localhost:3000');
      const token = jwt.sign(
      { user_id: email,},
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
      returningUser_response.cookies.set('token', token, { 
      httpOnly: false, 
      secure: false,  // Allow over HTTP for localhost, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',    
      path: '/',
      maxAge: 45   //60 * 60 * 24, 1 day - those seconds
  });      
      return returningUser_response;
    }
  } catch (userinfoError) {
    console.error('Error fetching user info:', userinfoError);
    // Redirect with a userinfo-failed flag
    return NextResponse.redirect(`http://localhost:3000/login?error=userinfo_failed`);
  }
}
// import { NextResponse } from 'next/server';
// import { google } from 'googleapis';

// export async function GET(req) {
//   const url = new URL(req.url);
//   const code = url.searchParams.get('code');

//   const oauth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     'http://localhost:3000/api/auth/google/callback'
//   );

//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);

//   const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
//   const { data } = await oauth2.userinfo.get();
//   const email = data.email;

//  return NextResponse.redirect(`http://localhost:3000/?google_email=${email}`);
// }

//   console.log('Google email:', email);
//   const response = NextResponse.redirect('http://localhost:3000/');
//   response.cookies.set('user_email', email, { 
//   httpOnly: true, 
//   secure: false,  // Allow over HTTP for localhost
//   sameSite: 'lax'
// })
//   return response;
/*
1. name (String): 'google_email'

What it is: This is the key or name of the cookie. It's how you'll identify and retrieve this specific piece of data later.
In your code: You're naming this cookie 'google_email'.
 This means whenever this cookie is sent back to the server, it will be identified by this name.

2. value (String): 'alice@example.com'

What it is: This is the actual data you want to store in the cookie.
In your code: You're setting the value of the google_email cookie to 'alice@example.com'.
 This is the information the server wants the client's browser to remember.

3. options (Object): { path: '/', maxAge: 60 * 5, httpOnly: false, secure: process.env.NODE_ENV === 'production' }

What it is: This is an object that contains various attributes to control how the cookie behaves.
 These attributes tell the browser important rules about the cookie's lifespan, visibility, and security.
response.cookies.set(name: string, value: string, options?: {
  path?: string,
  httpOnly?: boolean,
  secure?: boolean,
  sameSite?: 'lax'|'strict'|'none',
  maxAge?: number,        // in seconds
  expires?: Date,         // overrides maxAge if provided
  domain?: string,
})
 */
