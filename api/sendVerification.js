// Vercel Serverless Function
// Generates a verification code for the user, stores it in the user profile in Vercel Blob.

import { put, head } from '@vercel/blob';
import fetch from 'node-fetch';
import crypto from 'crypto';

function generateNumericCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export default async function handler(request, response) {
  if (request.method === 'POST') {
    try {
      const { userId, userEmail } = request.body || {};
      if (!userId || !userEmail) {
        return response.status(400).json({ message: 'Missing userId or userEmail' });
      }

      const userProfilePath = `users/${userId}.json`;
      const code = generateNumericCode(6);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Load existing profile if any
      let profile = { userId, userName: userEmail };
      try {
        const userBlob = await head(userProfilePath);
        const existingUserProfileResponse = await fetch(userBlob.url);
        if (existingUserProfileResponse.ok) {
          profile = await existingUserProfileResponse.json();
        }
      } catch (err) {
        // no existing profile
      }

      // Store verification code and expiry
      profile.verificationCode = code;
      profile.verificationExpires = expiresAt;
      profile.userName = userEmail;

      await put(userProfilePath, JSON.stringify(profile), {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: true,
      });

      // Try to send via SendGrid if configured
      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
      const SENDER_EMAIL = process.env.SENDER_EMAIL || process.env.SENDGRID_SENDER || null;
      let sendResult = { sent: false };

      if (SENDGRID_API_KEY && SENDER_EMAIL) {
        try {
          const mail = {
            personalizations: [
              {
                to: [{ email: userEmail }],
                subject: 'Your verification code',
              },
            ],
            from: { email: SENDER_EMAIL },
            content: [
              { type: 'text/plain', value: `Your verification code is: ${code}\nIt will expire at ${expiresAt}.` },
            ],
          };

          const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SENDGRID_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mail),
          });

          if (!sgRes.ok) {
            const txt = await sgRes.text();
            console.error('SendGrid send failed:', sgRes.status, txt);
            sendResult = { sent: false, error: txt };
          } else {
            sendResult = { sent: true };
          }
        } catch (err) {
          console.error('SendGrid error:', err);
          sendResult = { sent: false, error: err.message };
        }
      } else {
        // No email provider configured; log code for dev/testing
        console.log(`Verification code for ${userEmail} (${userId}): ${code} (expires ${expiresAt})`);
        sendResult = { sent: false, fallbackLogged: true };
      }

      return response.status(200).json({ ok: true, sendResult });
    } catch (error) {
      console.error('sendVerification error:', error);
      return response.status(500).json({ message: 'Error generating verification code', error: error.message });
    }
  }

  response.setHeader('Allow', ['POST']);
  response.status(405).end(`Method ${request.method} Not Allowed`);
}
