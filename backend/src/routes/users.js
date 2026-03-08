const express = require('express');
const router = express.Router();
const db = require('../db');

// Get user profile with stats
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const viewerId = req.query.viewerId;
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

        const followersSnapshot = await db.collection('users').doc(userId).collection('followers').get();
        const followingSnapshot = await db.collection('users').doc(userId).collection('following').get();
        
        let isFollowing = false;
        let isBlocked = false;
        if (viewerId) {
            const followDoc = await db.collection('users').doc(userId).collection('followers').doc(viewerId).get();
            isFollowing = followDoc.exists;

            const blockDoc = await db.collection('blocked_users')
                .where('user_id', '==', viewerId)
                .where('blocked_user_id', '==', userId)
                .get();
            isBlocked = !blockDoc.empty;
        }

        const stats = {
            id: userId,
            username: userData.username,
            email: userData.email,
            createdAt: userData.createdAt,
            totalComments: comments.length,
            totalUpvotesReceived: comments.reduce((acc, c) => acc + (c.voteCount || 0), 0),
            topicsCreated: manifestos.length,
            followersCount: followersSnapshot.size,
            followingCount: followingSnapshot.size,
            message_permission: userData.message_permission || 'everyone',
            isFollowing,
            isBlocked,
            manifestos,
            comments
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Search users by username
router.get('/search/:query', async (req, res) => {
    try {
        const queryStr = req.params.query.toLowerCase();
        const snapshot = await db.collection('users').get();
        const users = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.username && data.username.toLowerCase().includes(queryStr)) {
                users.push({
                    id: doc.id,
                    username: data.username,
                    photoURL: data.photoURL,
                    email: data.email
                });
            }
        });

        res.json(users.slice(0, 10)); // Limit to 10 results
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user data
router.patch('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        
        await db.collection('users').doc(userId).update(updates);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Follow/Unfollow User
router.post('/follow', async (req, res) => {
    try {
        const { followerId, targetId } = req.body;
        if (!followerId || !targetId) {
            return res.status(400).json({ error: 'Both followerId and targetId are required' });
        }

        const followRef = db.collection('users').doc(targetId).collection('followers').doc(followerId);
        const followingRef = db.collection('users').doc(followerId).collection('following').doc(targetId);

        const followDoc = await followRef.get();

        if (followDoc.exists) {
            // Unfollow
            await followRef.delete();
            await followingRef.delete();
            res.json({ following: false });
        } else {
            // Follow
            await followRef.set({ createdAt: new Date().toISOString() });
            await followingRef.set({ createdAt: new Date().toISOString() });
            res.json({ following: true });
        }
    } catch (error) {
        console.error('Error in follow/unfollow:', error);
        res.status(500).json({ error: error.message });
    }
});

// Block/Unblock User
router.post('/block', async (req, res) => {
    try {
        const { userId, targetId } = req.body;
        if (!userId || !targetId) {
            return res.status(400).json({ error: 'Both userId and targetId are required' });
        }

        const blockQuery = await db.collection('blocked_users')
            .where('user_id', '==', userId)
            .where('blocked_user_id', '==', targetId)
            .get();

        if (!blockQuery.empty) {
            // Unblock
            const batch = db.batch();
            blockQuery.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            res.json({ blocked: false });
        } else {
            // Block
            await db.collection('blocked_users').add({
                user_id: userId,
                blocked_user_id: targetId,
                created_at: new Date().toISOString()
            });
            res.json({ blocked: true });
        }
    } catch (error) {
        console.error('Error in block/unblock:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
