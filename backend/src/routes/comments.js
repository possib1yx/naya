const express = require('express');
const router = express.Router();
const db = require('../db');
const admin = require('firebase-admin');

// Post a comment
router.post('/', async (req, res) => {
  const { content, manifestoId, userId, parentId, isAnonymous, authorName } = req.body;
  try {
    const commentRef = db.collection('comments').doc();
    const commentData = {
      content,
      manifestoId,
      userId,
      authorName: authorName || 'User',
      parentId: parentId || null,
      isAnonymous: !!isAnonymous,
      createdAt: new Date().toISOString(),
      voteCount: 0
    };

    await commentRef.set(commentData);

    // Increment commentCount on manifesto
    await db.collection('manifestos').doc(manifestoId).update({
      commentCount: admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({ id: commentRef.id, ...commentData });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comments for manifesto
router.get('/manifesto/:id', async (req, res) => {
  try {
    const commentsSnapshot = await db.collection('comments')
      .where('manifestoId', '==', req.params.id)
      .get();
    
    const comments = [];
    commentsSnapshot.forEach(doc => {
      const data = doc.data();
      comments.push({ id: doc.id, ...data });
    });

    // Sort in memory to avoid needing a composite index
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  const manifestoId = req.body.manifestoId || req.query.manifestoId;
  const userId = req.body.userId || req.query.userId;
  
  console.log(`[DELETE DEBUG] Attempting to delete comment: ${req.params.id} (User: ${userId}, Manifesto: ${manifestoId})`);
  
  if (!manifestoId || !userId) {
    return res.status(400).json({ error: 'manifestoId and userId are required' });
  }

  try {
    const commentRef = db.collection('comments').doc(req.params.id);
    const commentDoc = await commentRef.get();
    
    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    // OWNERSHIP CHECK
    if (commentData.userId !== userId) {
      console.warn(`[DELETE AUTH] Unauthorized delete attempt by ${userId} for comment owned by ${commentData.userId}`);
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own comments.' });
    }

    // 1. Delete associated votes (flat collection)
    const votesSnapshot = await db.collection('votes').where('commentId', '==', req.params.id).get();
    const batch = db.batch();
    votesSnapshot.forEach(doc => batch.delete(doc.ref));

    // 2. Delete the comment itself
    batch.delete(commentRef);
    await batch.commit();

    // 3. Decrement commentCount on manifesto
    await db.collection('manifestos').doc(manifestoId).update({
      commentCount: admin.firestore.FieldValue.increment(-1)
    });

    res.json({ message: 'Perspective discarded successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
