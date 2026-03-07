const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function syncCounts() {
  const manifestosSnapshot = await db.collection('manifestos').get();
  
  for (const manifestoDoc of manifestosSnapshot.docs) {
    const commentsSnapshot = await manifestoDoc.ref.collection('comments').get();
    const count = commentsSnapshot.size;
    
    await manifestoDoc.ref.update({ commentCount: count });
    console.log(`Updated ${manifestoDoc.id} with count ${count}`);
  }
  process.exit(0);
}

syncCounts().catch(err => {
  console.error(err);
  process.exit(1);
});
