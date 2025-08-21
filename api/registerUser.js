// Vercel Serverless Function
// Registers a user/device and returns a device token. Stores profile in Vercel Blob.

import { put, head } from '@vercel/blob';
import fetch from 'node-fetch';

// registerUser now creates/updates the user profile and marks verification pending.
// It no longer issues a deviceToken directly. Instead, `sendVerification` will place a code
// in the profile and `verifyEmail` will issue the deviceToken after successful verification.

export default async function handler(request, response) {
  if (request.method === 'POST') {
    try {
      const { userId, userEmail, timestamp } = request.body || {};
      if (!userId || !userEmail) {
        return response.status(400).json({ message: 'Missing userId or userEmail' });
      }

      const ts = timestamp || new Date().toISOString();
      const userProfilePath = `users/${userId}.json`;

      let userProfile = {
        userId,
        userName: userEmail,
        firstSeen: ts,
        lastActive: ts,
      };

      try {
        const userBlob = await head(userProfilePath);
        const existingUserProfileResponse = await fetch(userBlob.url);
        if (existingUserProfileResponse.ok) {
          const existing = await existingUserProfileResponse.json();
          userProfile.firstSeen = existing.firstSeen || userProfile.firstSeen;
          userProfile.lastActive = ts;
          userProfile.userName = userEmail;
          // preserve deviceToken if present
          if (existing.deviceToken) userProfile.deviceToken = existing.deviceToken;
        }
      } catch (err) {
        // no existing profile
      }

      // Mark that verification is pending on client side; actual code is created by /api/sendVerification
      userProfile.verificationPending = true;

      await put(userProfilePath, JSON.stringify(userProfile), {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: true,
      });

      return response.status(200).json({ ok: true });
    } catch (error) {
      console.error('registerUser error:', error);
      return response.status(500).json({ message: 'Error registering user', error: error.message });
    }
  }

  response.setHeader('Allow', ['POST']);
  response.status(405).end(`Method ${request.method} Not Allowed`);
}
