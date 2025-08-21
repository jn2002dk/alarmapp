// Vercel Serverless Function
// Registers a user/device and returns a device token. Stores profile in Vercel Blob.

import { put, head } from '@vercel/blob';
import fetch from 'node-fetch';
import crypto from 'crypto';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    try {
      const { userId, userEmail, timestamp } = request.body || {};
      if (!userId || !userEmail) {
        return response.status(400).json({ message: 'Missing userId or userEmail' });
      }

      const ts = timestamp || new Date().toISOString();
      const userProfilePath = `users/${userId}.json`;

      // Create a strong random device token
      const deviceToken = crypto.randomBytes(32).toString('hex');

      let userProfile = {
        userId,
        userName: userEmail,
        deviceToken,
        firstSeen: ts,
        lastActive: ts,
      };

      // If a profile already exists, preserve firstSeen and update lastActive & username & deviceToken
      try {
        const userBlob = await head(userProfilePath);
        const existingUserProfileResponse = await fetch(userBlob.url);
        if (existingUserProfileResponse.ok) {
          const existing = await existingUserProfileResponse.json();
          userProfile.firstSeen = existing.firstSeen || userProfile.firstSeen;
          userProfile.lastActive = ts;
          userProfile.userName = userEmail;
          userProfile.deviceToken = deviceToken; // rotate token on register
        }
      } catch (err) {
        // no-op, will write new profile
      }

      await put(userProfilePath, JSON.stringify(userProfile), {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: true,
      });

      return response.status(200).json({ ok: true, deviceToken });
    } catch (error) {
      console.error('registerUser error:', error);
      return response.status(500).json({ message: 'Error registering user', error: error.message });
    }
  }

  response.setHeader('Allow', ['POST']);
  response.status(405).end(`Method ${request.method} Not Allowed`);
}
