const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple in-memory cache to reduce Firestore reads (saves quota)
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const getCache = (key) => cache[key] && Date.now() < cache[key].expiry ? cache[key].data : null;
const setCache = (key, data) => { cache[key] = { data, expiry: Date.now() + CACHE_TTL }; };

// Get trending manifestos
router.get('/trending', async (req, res) => {
  try {
    const cached = getCache('trending');
    if (cached) return res.json(cached);

    const manifestosSnapshot = await db.collection('manifestos').limit(20).get();
    
    const manifestos = [];
    manifestosSnapshot.forEach(doc => {
      manifestos.push({ id: doc.id, ...doc.data() });
    });

    // Score = voteCount + commentCount (simplified)
    const trending = manifestos
      .sort((a, b) => ((b.voteCount || 0) + (b.commentCount || 0)) - ((a.voteCount || 0) + (a.commentCount || 0)))
      .slice(0, 5);

    setCache('trending', trending);
    res.json(trending);
  } catch (error) {
    console.error('Error fetching trending manifestos:', error);
    res.json(getCache('trending') || []);
  }
});

// Get Top manifestos (Top Ideas)
router.get('/top', async (req, res) => {
  try {
    const manifestosSnapshot = await db.collection('manifestos')
      .get();
    
    const manifestos = [];
    manifestosSnapshot.forEach(doc => {
      manifestos.push({ id: doc.id, ...doc.data() });
    });

    manifestos.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    res.json(manifestos.slice(0, 10));
  } catch (error) {
    console.error('Error fetching top manifestos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all manifestos
router.get('/', async (req, res) => {
  try {
    const cached = getCache('all');
    if (cached) return res.json(cached);

    const manifestosSnapshot = await db.collection('manifestos').limit(50).get();
    const manifestos = [];
    manifestosSnapshot.forEach(doc => {
      manifestos.push({ id: doc.id, ...doc.data() });
    });
    manifestos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(manifestos);
  } catch (error) {
    console.error('Error fetching manifestos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single manifesto
router.get('/:id', async (req, res) => {
  try {
    const manifestoDoc = await db.collection('manifestos').doc(req.params.id).get();
    
    if (!manifestoDoc.exists) {
      return res.status(404).json({ error: 'Manifesto not found' });
    }

    const manifesto = { id: manifestoDoc.id, ...manifestoDoc.data() };

    // Fetch comments (FLAT COLLECTION)
    const commentsSnapshot = await db.collection('comments')
      .where('manifestoId', '==', req.params.id)
      .get();
      
    const comments = [];
    commentsSnapshot.forEach(doc => {
      comments.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    manifesto.comments = comments;
    res.json(manifesto);
  } catch (error) {
    console.error('Error fetching manifesto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create manifesto
router.post('/', async (req, res) => {
  const { title, description, category, userId } = req.body;
  try {
    const manifestoRef = db.collection('manifestos').doc();
    const manifestoData = {
      title,
      description,
      category: category || "Discussion",
      createdById: userId || req.body.createdById,
      createdAt: new Date().toISOString(),
      commentCount: 0,
      voteCount: 0
    };

    await manifestoRef.set(manifestoData);
    
    res.status(201).json({ id: manifestoRef.id, ...manifestoData });
  } catch (error) {
    console.error('Error creating manifesto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete manifesto
router.delete('/:id', async (req, res) => {
  console.log(`[DELETE DEBUG] Attempting to delete manifesto: ${req.params.id}`);
  try {
    const docRef = db.collection('manifestos').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Manifesto not found' });
    }

    // 1. Find all comments related to this manifesto
    const commentsSnapshot = await db.collection('comments')
      .where('manifestoId', '==', req.params.id)
      .get();
    
    const batch = db.batch();
    
    // 2. Delete all related comments, their child comments, and their votes
    for (const commentDoc of commentsSnapshot.docs) {
      // Delete votes subcollection for this comment
      const votesSnapshot = await commentDoc.ref.collection('votes').get();
      votesSnapshot.forEach(voteDoc => batch.delete(voteDoc.ref));
      
      // Find and delete all child comments (replies) and their votes
      const childCommentsSnapshot = await db.collection('comments')
        .where('parentId', '==', commentDoc.id)
        .get();
      
      for (const childDoc of childCommentsSnapshot.docs) {
        // Delete votes for child comment
        const childVotesSnapshot = await childDoc.ref.collection('votes').get();
        childVotesSnapshot.forEach(voteDoc => batch.delete(voteDoc.ref));
        batch.delete(childDoc.ref);
      }
      
      // Delete the comment itself
      batch.delete(commentDoc.ref);
    }
    
    // 3. Delete manifesto's own votes subcollection
    const manifestoVotesSnapshot = await docRef.collection('votes').get();
    manifestoVotesSnapshot.forEach(voteDoc => batch.delete(voteDoc.ref));

    // 4. Delete the manifesto document
    batch.delete(docRef);
    await batch.commit();

    console.log(`[DELETE DEBUG] Successfully deleted manifesto: ${req.params.id}`);
    res.json({ message: 'Vision erased successfully' });
  } catch (error) {
    console.error('Error deleting manifesto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
