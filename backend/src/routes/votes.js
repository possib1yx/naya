const express = require('express');
const router = express.Router();
const db = require('../db');
const admin = require('firebase-admin');

/**
 * Vote on a topic or comment
 * body: { manifestoId, commentId (optional), userId, voteType ('UP' or 'DOWN') }
 */
router.post('/', async (req, res) => {
  let { manifestoId, commentId, userId, voteType } = req.body;
  
  if (!voteType) return res.status(400).json({ error: 'voteType is required' });
  voteType = voteType.toUpperCase();

  if (!['UP', 'DOWN'].includes(voteType)) {
    return res.status(400).json({ error: 'voteType must be UP or DOWN' });
  }

  try {
    const manifestoRef = db.collection('manifestos').doc(manifestoId);
    let voteRef;
    let targetRef;

    if (commentId) {
      voteRef = db.collection('comments').doc(commentId).collection('votes').doc(userId);
      targetRef = db.collection('comments').doc(commentId);
    } else {
      voteRef = manifestoRef.collection('votes').doc(userId);
      targetRef = manifestoRef;
    }
    
    const voteDoc = await voteRef.get();
    let voteChange = 0;

    if (voteDoc.exists) {
      const existingVote = voteDoc.data();
      if (existingVote.type === voteType) {
        return res.status(400).json({ error: `You have already ${voteType.toLowerCase()}voted this topic/comment` });
      }

      // Switching vote (e.g., UP -> DOWN is -2, DOWN -> UP is +2)
      voteChange = voteType === 'UP' ? 2 : -2;
      
      await voteRef.update({
        type: voteType,
        updatedAt: new Date().toISOString()
      });
    } else {
      // New vote
      voteChange = voteType === 'UP' ? 1 : -1;
      
      await voteRef.set({
        userId,
        type: voteType,
        createdAt: new Date().toISOString()
      });
    }

    console.log(`[VOTE DEBUG] Target: ${commentId ? 'Comment' : 'Topic'}, manifestoId: ${manifestoId}, commentId: ${commentId}, type: ${voteType}, change: ${voteChange}`);

    // Update target's total vote count
    await targetRef.update({
      voteCount: admin.firestore.FieldValue.increment(voteChange)
    });

    res.status(200).json({ message: 'Vote recorded', voteType, newVoteChange: voteChange });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Remove a vote
 * body: { manifestoId, commentId (optional), userId }
 */
router.delete('/', async (req, res) => {
  const { manifestoId, commentId, userId } = req.body;
  try {
    const manifestoRef = db.collection('manifestos').doc(manifestoId);
    let voteRef;
    let targetRef;

    if (commentId) {
      voteRef = db.collection('comments').doc(commentId).collection('votes').doc(userId);
      targetRef = db.collection('comments').doc(commentId);
    } else {
      voteRef = manifestoRef.collection('votes').doc(userId);
      targetRef = manifestoRef;
    }
    
    const voteDoc = await voteRef.get();
    if (!voteDoc.exists) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    const { type } = voteDoc.data();
    const voteChange = type === 'UP' ? -1 : 1;

    console.log(`Vote removed. previousType: ${type}, voteChange: ${voteChange}`);

    await voteRef.delete();

    // Revert target's total vote count
    await targetRef.update({
      voteCount: admin.firestore.FieldValue.increment(voteChange)
    });

    res.json({ message: 'Vote removed' });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
