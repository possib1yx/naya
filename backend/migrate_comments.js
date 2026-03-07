const db = require('./src/db');

async function migrate() {
  console.log('--- STARTING COMMENT MIGRATION ---');
  
  // 1. Get all manifestos
  const manifestosSnapshot = await db.collection('manifestos').get();
  let totalMigrated = 0;

  for (const manifestoDoc of manifestosSnapshot.docs) {
    const manifestoId = manifestoDoc.id;
    console.log(`Processing manifesto: ${manifestoId}`);

    // 2. Get comments from sub-collection
    const commentsSnapshot = await manifestoDoc.ref.collection('comments').get();
    
    for (const commentDoc of commentsSnapshot.docs) {
      const commentData = commentDoc.data();
      const commentId = commentDoc.id;

      // 3. Save to top-level 'comments' collection
      // We keep the SAME document ID to ensure existing votes/references might still work if we adjust the path
      await db.collection('comments').doc(commentId).set({
        ...commentData,
        manifestoId: manifestoId // Ensure this is present
      });

      // 4. Migrate votes for this comment
      const votesSnapshot = await commentDoc.ref.collection('votes').get();
      for (const voteDoc of votesSnapshot.docs) {
        await db.collection('comments').doc(commentId).collection('votes').doc(voteDoc.id).set(voteDoc.data());
      }

      totalMigrated++;
      console.log(`  Migrated comment: ${commentId}`);
    }
  }

  console.log(`--- MIGRATION COMPLETE: ${totalMigrated} comments moved ---`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
