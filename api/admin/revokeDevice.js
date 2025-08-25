import { put, head } from '@vercel/blob';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { pass, userId } = req.body || {};
  if (!process.env.ADMIN_PASS || pass !== process.env.ADMIN_PASS) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  const userProfilePath = `users/${userId}.json`;
  try {
    const userBlob = await head(userProfilePath);
    const pRes = await fetch(userBlob.url);
    if (!pRes.ok) return res.status(404).json({ message: 'Profile not found' });
    const profile = await pRes.json();

    delete profile.deviceToken;
    profile.revokedAt = new Date().toISOString();

    await put(userProfilePath, JSON.stringify(profile), {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('admin/revokeDevice error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
