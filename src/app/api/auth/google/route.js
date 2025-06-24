// src/app/api/auth/google/route.js
import { google } from 'googleapis';

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'http://localhost:3000/api/auth/google/callback';
  const oauth2Client = new google.auth.OAuth2(clientId, null, redirectUri);

  // The scopes we need: email and profile
  const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  // Generate the URL to redirect the user to Google’s consent screen
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // “offline” to get a refresh token
    prompt: 'consent',      // force consent every time (so you always get a refresh token)
    scope: scope,
  });

  // Redirect the user to Google’s OAuth consent page
  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
    },
  });
}
