const express = require('express');
const router = express.Router();
const db = require('../db');

// Get Top 3 Comments Today
router.get('/daily', async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Firestore query for top comments across all manifestos is tricky without a flat comments collection
    // If comments are sub-collections, we'd need a collectionGroup query
    const topCommentsSnapshot = await db.collection('comments')
      .where('createdAt', '>=', twentyFourHoursAgo)
      .get();

    const topComments = [];
    topCommentsSnapshot.forEach(doc => {
      topComments.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory by voteCount desc
    topComments.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    
    res.json(topComments.slice(0, 3));
  } catch (error) {
    console.error('Error fetching daily top comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Weekly Top
router.get('/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const topCommentsSnapshot = await db.collection('comments')
      .where('createdAt', '>=', oneWeekAgo)
      .get();

    const topComments = [];
    topCommentsSnapshot.forEach(doc => {
      topComments.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory
    topComments.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    
    res.json(topComments.slice(0, 10));
  } catch (error) {
    console.error('Error fetching weekly top comments:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
