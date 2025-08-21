// Vercel Serverless Function
// Verifies a user's code and, if valid, issues a deviceToken and clears verification fields.

import { put, head } from '@vercel/blob';
import fetch from 'node-fetch';
import crypto from 'crypto';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    try {
      const { userId, code } = request.body || {};
      if (!userId || !code) {
        return response.status(400).json({ message: 'Missing userId or code' });
      }

      const userProfilePath = `users/${userId}.json`;
      let profile;
      try {
        const userBlob = await head(userProfilePath);
        const existingUserProfileResponse = await fetch(userBlob.url);
        if (!existingUserProfileResponse.ok) {
          return response.status(404).json({ message: 'Profile not found' });
        }
        profile = await existingUserProfileResponse.json();
      } catch (err) {
        return response.status(404).json({ message: 'Profile not found' });
      }

      if (!profile.verificationCode || !profile.verificationExpires) {
        return response.status(400).json({ message: 'No verification pending' });
      }

      if (new Date() > new Date(profile.verificationExpires)) {
        return response.status(400).json({ message: 'Verification code expired' });
      }

      if (profile.verificationCode !== String(code).trim()) {
        return response.status(400).json({ message: 'Invalid verification code' });
      }

      // Passed verification: issue device token and clear verification fields
      const deviceToken = crypto.randomBytes(32).toString('hex');
      profile.deviceToken = deviceToken;
      delete profile.verificationCode;
      delete profile.verificationExpires;
      profile.verifiedAt = new Date().toISOString();

      await put(userProfilePath, JSON.stringify(profile), {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: true,
      });

      return response.status(200).json({ ok: true, deviceToken });
    } catch (error) {
      console.error('verifyEmail error:', error);
      return response.status(500).json({ message: 'Error verifying code', error: error.message });
    }
  }

  response.setHeader('Allow', ['POST']);
  response.status(405).end(`Method ${request.method} Not Allowed`);
}
