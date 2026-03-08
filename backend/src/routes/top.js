const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple in-memory cache to reduce Firestore reads
const cache = {
  daily: { data: null, expiry: 0 },
  weekly: { data: null, expiry: 0 }
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Get Top 3 Comments Today
router.get('/daily', async (req, res) => {
  try {
    // Return cached data if still fresh
    if (cache.daily.data && Date.now() < cache.daily.expiry) {
      return res.json(cache.daily.data);
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const topCommentsSnapshot = await db.collection('comments')
      .where('createdAt', '>=', twentyFourHoursAgo)
      .limit(50) // Limit reads — only top 50 from last 24h
      .get();

    const topComments = [];
    topCommentsSnapshot.forEach(doc => {
      topComments.push({ id: doc.id, ...doc.data() });
    });

    topComments.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    const result = topComments.slice(0, 3);

    // Cache the result
    cache.daily.data = result;
    cache.daily.expiry = Date.now() + CACHE_TTL;

    res.json(result);
  } catch (error) {
    console.error('Error fetching daily top comments:', error);
    // Return empty array instead of 500 so frontend doesn't break
    res.json(cache.daily.data || []);
  }
});

// Get Weekly Top
router.get('/weekly', async (req, res) => {
  try {
    if (cache.weekly.data && Date.now() < cache.weekly.expiry) {
      return res.json(cache.weekly.data);
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const topCommentsSnapshot = await db.collection('comments')
      .where('createdAt', '>=', oneWeekAgo)
      .limit(100)
      .get();

    const topComments = [];
    topCommentsSnapshot.forEach(doc => {
      topComments.push({ id: doc.id, ...doc.data() });
    });

    topComments.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    const result = topComments.slice(0, 10);

    cache.weekly.data = result;
    cache.weekly.expiry = Date.now() + CACHE_TTL;

    res.json(result);
  } catch (error) {
    console.error('Error fetching weekly top comments:', error);
    res.json(cache.weekly.data || []);
  }
});

module.exports = router;
