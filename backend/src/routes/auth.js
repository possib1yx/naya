const express = require('express');
const router = express.Router();
const db = require('../db');

// Sync Firebase user with Firestore
router.post('/sync', async (req, res) => {
  const { uid, email, displayName } = req.body;
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let user;
    if (!userDoc.exists) {
      user = {
        email,
        username: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        role: 'user' // Default role
      };
      await userRef.set(user);
    } else {
      user = userDoc.data();
    }

    res.json({ id: uid, ...user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
