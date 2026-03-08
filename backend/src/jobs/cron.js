const cron = require('node-cron');
const db = require('../db');

// Run once per day at midnight to update rankings (reduced from hourly to save Firestore quota)
cron.schedule('0 0 * * *', async () => {
  console.log('Running background job: Ranking & Filtering...');
  
  try {
    const commentsSnapshot = await db.collection('comments').get();
    
    const now = Date.now();
    for (const doc of commentsSnapshot.docs) {
      const commentData = doc.data();
      const hoursSincePost = (now - new Date(commentData.createdAt).getTime()) / (1000 * 60 * 60);
      
      // Auto Filtering Rules
      // Rule 1: votes < 2 after 24 hours
      if (hoursSincePost > 24 && (commentData.voteCount || 0) < 2) {
        await doc.ref.update({ status: 'HIDDEN' });
        console.log(`Hidden comment ${doc.id} due to low engagement.`);
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

// Run every Sunday at midnight to store weekly top comments (Archival)
cron.schedule('0 0 * * 0', async () => {
  console.log('Running background job: Archiving Weekly Top Comments...');
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const topCommentsSnapshot = await db.collection('comments')
      .where('createdAt', '>=', oneWeekAgo)
      .get();
    
    // Sort and limit in memory to avoid needing a complex composite index
    topCommentsSnapshot.docs.sort((a, b) => (b.data().voteCount || 0) - (a.data().voteCount || 0));
    const finalDocs = topCommentsSnapshot.docs.slice(0, 10);

    // Store in weekly_top collection
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    
    for (const doc of finalDocs) {
      const commentData = doc.data();
      await db.collection('weekly_top').add({
        weekNumber: currentWeek,
        voteCount: commentData.voteCount,
        commentId: doc.id,
        manifestoId: commentData.manifestoId,
        archivedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in weekly archival:', error);
  }
});
