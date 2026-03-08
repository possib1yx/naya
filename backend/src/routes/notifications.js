const express = require('express');
const router = express.Router();
const db = require('../db');
const admin = require('firebase-admin');

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const snapshot = await db.collection('notifications')
      .where('recipientId', '==', userId)
      .limit(20)
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    await db.collection('notifications').doc(req.params.id).update({
      isRead: true
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.patch('/read-all/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const snapshot = await db.collection('notifications')
      .where('recipientId', '==', userId)
      .where('isRead', '==', false)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
