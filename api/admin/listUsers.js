import { head } from '@vercel/blob';
import fetch from 'node-fetch';

// Basic admin endpoints protected by ADMIN_PASS env var (set in Vercel). This is
// intentionally simple; replace with a proper auth provider for production.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { pass } = req.body || {};
  if (!process.env.ADMIN_PASS || pass !== process.env.ADMIN_PASS) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const indexPath = `users/index.json`;
    let index = [];
    try {
      const idxBlob = await head(indexPath);
      const idxRes = await fetch(idxBlob.url);
      if (idxRes.ok) index = await idxRes.json();
    } catch (err) {
      index = [];
    }

    // Fetch each profile (async parallel)
    const profiles = await Promise.all(index.map(async (userId) => {
      try {
        const pBlob = await head(`users/${userId}.json`);
        const pRes = await fetch(pBlob.url);
        if (pRes.ok) return await pRes.json();
      } catch (err) {
        return { userId, error: 'not found' };
      }
      return { userId };
    }));

    return res.status(200).json({ ok: true, users: profiles });
  } catch (err) {
    console.error('admin/listUsers error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
