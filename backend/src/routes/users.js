const express = require('express');
const router = express.Router();
const db = require('../db');

// Get user profile with stats
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();

        // Get manifestos (Zero Index)
        const manifestosSnapshot = await db.collection('manifestos').get();
        const manifestos = [];
        manifestosSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdById === userId) {
                manifestos.push({ id: doc.id, ...data });
            }
        });
        manifestos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Get comments (Zero Index)
        const commentsSnapshot = await db.collection('comments').get();
        const comments = [];
        commentsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId === userId) {
                comments.push({ id: doc.id, ...data });
            }
        });
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const stats = {
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt,
            totalComments: comments.length,
            totalUpvotesReceived: comments.reduce((acc, c) => acc + (c.voteCount || 0), 0),
            topicsCreated: manifestos.length,
            manifestos,
            comments
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
