// Vercel Serverless Function
// Receives tracking data, processes it, and stores it using Vercel Blob.

import { put, head } from '@vercel/blob';
import fetch from 'node-fetch';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    try {
      const eventData = request.body;
      const { userId, userName, button, timestamp, deviceToken } = eventData;

      if (!userId || !userName || !button || !timestamp || !deviceToken) {
        return response.status(400).json({ message: 'Missing required event data. deviceToken required.' });
      }

      const userProfilePath = `users/${userId}.json`;
      let userProfile;

      try {
        const userBlob = await head(userProfilePath);
        const existingUserProfileResponse = await fetch(userBlob.url);
        if (existingUserProfileResponse.ok) {
          userProfile = await existingUserProfileResponse.json();
          // Validate device token
          if (!userProfile.deviceToken || userProfile.deviceToken !== deviceToken) {
            console.warn('Device token mismatch for user', userId);
            return response.status(403).json({ message: 'Invalid device token.' });
          }
          // Update server-side lastActive and username
          userProfile.lastActive = timestamp;
          userProfile.userName = userName;
        } else {
          userProfile = {
            userId,
            userName,
            firstSeen: timestamp,
            lastActive: timestamp,
            deviceToken: deviceToken,
          };
        }
      } catch (error) {
        // If profile doesn't exist, create it but require token to be present
        userProfile = {
          userId,
          userName,
          firstSeen: timestamp,
          lastActive: timestamp,
          deviceToken: deviceToken,
        };
      }
      
      await put(userProfilePath, JSON.stringify(userProfile), {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: true,
      });

      const sanitizedButtonLabel = button.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      const serverTs = new Date().toISOString();
      const eventPath = `events/${userId}/${serverTs}-${sanitizedButtonLabel}.json`;
      const eventToStore = { ...eventData, serverTs };
      await put(eventPath, JSON.stringify(eventToStore), {
        access: 'private',
        contentType: 'application/json',
      });

      // Special action for button 1 (Hovedbygning)
      if (button === 'Hovedbygning') {
        try {
          const extRes = await fetch('https://clevertouchlive.com/actions/68185bfe588ebd9c23003abc/public_execute?hash=fff61042299798ba229bacf23aa9d4f8', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const extText = await extRes.text();
          console.log('External action triggered for Hovedbygning', extRes.status, extText);
        } catch (err) {
          console.error('Failed to trigger external action:', err);
        }
      }

      console.log('Tracking Data Processed and Stored:', { userProfilePath, eventPath });
      response.status(200).json({ 
        message: 'Data received and stored successfully', 
        userProfilePath, 
        eventPath 
      });

    } catch (error) {
      console.error('Error processing request with Vercel Blob:', error);
      response.status(500).json({ message: 'Error processing request', error: error.message });
    }
  } else {
    response.setHeader('Allow', ['POST']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
