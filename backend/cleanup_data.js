const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function cleanupData() {
  console.log("Starting data cleanup...");

  // 1. Delete all non-SYSTEM manifestos
  const snapshot = await db.collection('manifestos').where('createdById', '!=', 'SYSTEM').get();
  console.log(`Found ${snapshot.size} non-system manifestos to delete.`);
  
  for (const doc of snapshot.docs) {
    // Delete sub-collections (comments, votes)
    const commentsSnapshot = await doc.ref.collection('comments').get();
    for (const commentDoc of commentsSnapshot.docs) {
      // Delete votes sub-collection of comment
      const commentVotesSnapshot = await commentDoc.ref.collection('votes').get();
      for (const vDoc of commentVotesSnapshot.docs) await vDoc.ref.delete();
      await commentDoc.ref.delete();
    }
    
    const votesSnapshot = await doc.ref.collection('votes').get();
    for (const vDoc of votesSnapshot.docs) await vDoc.ref.delete();
    
    await doc.ref.delete();
    console.log(`Deleted manifesto: ${doc.id}`);
  }

  // 2. Clear comments on SYSTEM manifestos to start fresh
  const systemSnapshot = await db.collection('manifestos').where('createdById', '==', 'SYSTEM').get();
  for (const doc of systemSnapshot.docs) {
     const commentsSnapshot = await doc.ref.collection('comments').get();
     for (const commentDoc of commentsSnapshot.docs) {
       const commentVotesSnapshot = await commentDoc.ref.collection('votes').get();
       for (const vDoc of commentVotesSnapshot.docs) await vDoc.ref.delete();
       await commentDoc.ref.delete();
     }
     await doc.ref.update({ commentCount: 0 });
     console.log(`Cleared comments for system manifesto: ${doc.id}`);
  }

  console.log("Cleanup complete!");
  process.exit(0);
}

cleanupData().catch(err => {
  console.error(err);
  process.exit(1);
});
