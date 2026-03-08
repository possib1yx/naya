const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @route   POST /api/chat/start
 * @desc    Start or retrieve a conversation between two users
 */
router.post('/start', async (req, res) => {
    try {
        const { user1Id, user2Id } = req.body;
        if (!user1Id || !user2Id) {
            return res.status(400).json({ error: 'Both user IDs are required' });
        }

        // Check for blocks
        const block1 = await db.collection('blocked_users')
            .where('user_id', '==', user1Id)
            .where('blocked_user_id', '==', user2Id)
            .get();
        const block2 = await db.collection('blocked_users')
            .where('user_id', '==', user2Id)
            .where('blocked_user_id', '==', user1Id)
            .get();

        if (!block1.empty || !block2.empty) {
            return res.status(403).json({ error: 'Messaging is blocked between these users.' });
        }

        // Check if conversation already exists
        const conversations = await db.collection('conversations')
            .where('users', 'array-contains', user1Id)
            .get();

        let conversation = null;
        conversations.forEach(doc => {
            const data = doc.data();
            if (data.users.includes(user2Id)) {
                conversation = { id: doc.id, ...data };
            }
        });

        if (conversation) {
            return res.json(conversation);
        }

        // Create new conversation
        const newConversation = {
            users: [user1Id, user2Id],
            created_at: new Date().toISOString(),
            last_message: '',
            last_message_at: new Date().toISOString()
        };

        const docRef = await db.collection('conversations').add(newConversation);
        res.status(201).json({ id: docRef.id, ...newConversation });
    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/chat/list/:userId
 * @desc    Get all conversations for a specific user
 */
router.get('/list/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const snapshot = await db.collection('conversations')
            .where('users', 'array-contains', userId)
            .orderBy('last_message_at', 'desc')
            .get();

        const list = [];
        snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
        });

        res.json(list);
    } catch (error) {
        console.error('Error fetching chat list:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/chat/history/:conversationId
 * @desc    Get message history for a conversation
 */
router.get('/history/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const snapshot = await db.collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/chat/message
 * @desc    Send a message in a conversation
 */
router.post('/message', async (req, res) => {
    try {
        const { conversationId, senderId, receiverId, text, parentMessageId } = req.body;

        if (!conversationId || !senderId || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for blocks
        const block1 = await db.collection('blocked_users')
            .where('user_id', '==', senderId)
            .where('blocked_user_id', '==', receiverId)
            .get();
        const block2 = await db.collection('blocked_users')
            .where('user_id', '==', receiverId)
            .where('blocked_user_id', '==', senderId)
            .get();

        if (!block1.empty || !block2.empty) {
            return res.status(403).json({ error: 'Message blocked.' });
        }

        const messageData = {
            sender_id: senderId,
            receiver_id: receiverId,
            message: text,
            status: 'sent',
            timestamp: new Date().toISOString(),
            parent_message_id: parentMessageId || null,
        };

        // Add message to sub-collection
        await db.collection('conversations')
            .doc(conversationId)
            .collection('messages')
            .add(messageData);

        // Update conversation meta-data
        await db.collection('conversations').doc(conversationId).update({
            last_message: text,
            last_message_at: new Date().toISOString()
        });

        res.status(201).json(messageData);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
