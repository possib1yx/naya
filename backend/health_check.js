const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function healthCheck() {
  console.log("Starting health check and data migration...");

  // 1. Sync Manifesto voteCounts and usernames
  const manifestosSnapshot = await db.collection('manifestos').get();
  for (const manifestoDoc of manifestosSnapshot.docs) {
    const data = manifestoDoc.data();
    const updates = {};

    if (typeof data.voteCount !== 'number') {
      updates.voteCount = 0;
      console.log(`Initialized voteCount for manifesto ${manifestoDoc.id}`);
    }

    // 2. Fix Comments
    const commentsSnapshot = await manifestoDoc.ref.collection('comments').get();
    for (const commentDoc of commentsSnapshot.docs) {
      const commentData = commentDoc.data();
      const commentUpdates = {};

      if (commentData.isAnonymous === undefined) {
        commentUpdates.isAnonymous = false;
      }

      if (!commentData.authorName) {
        // Try to find user from users collection
        if (commentData.userId) {
          const userDoc = await db.collection('users').doc(commentData.userId).get();
          if (userDoc.exists) {
            commentUpdates.authorName = userDoc.data().username || userDoc.data().email.split('@')[0];
          } else {
            commentUpdates.authorName = 'User';
          }
        } else {
          commentUpdates.authorName = 'Anonymous';
        }
      }

      if (typeof commentData.voteCount !== 'number') {
        commentUpdates.voteCount = 0;
      }

      if (Object.keys(commentUpdates).length > 0) {
        await commentDoc.ref.update(commentUpdates);
        console.log(`Updated comment ${commentDoc.id} with:`, commentUpdates);
      }
    }

    if (Object.keys(updates).length > 0) {
      await manifestoDoc.ref.update(updates);
    }
  }

  console.log("Health check complete.");
  process.exit(0);
}

healthCheck().catch(err => {
  console.error(err);
  process.exit(1);
});
