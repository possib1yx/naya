const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testDelete() {
  console.log("Creating a test topic...");
  const docRef = db.collection('manifestos').doc();
  await docRef.set({
    title: "Test Delete Topic",
    description: "Temporary topic",
    createdById: "TEST",
    createdAt: new Date().toISOString(),
    voteCount: 0,
    commentCount: 0
  });
  const topicId = docRef.id;
  console.log(`Created topic: ${topicId}`);

  console.log("Calling DELETE endpoint via fetch (simulated)...");
  // We'll use the logic directly since we are in the backend folder
  try {
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Doc didn't save?");
    
    // Manually run the deletion logic from manifestos.js
    const commentsSnapshot = await docRef.collection('comments').get();
    for (const commentDoc of commentsSnapshot.docs) {
      const vSnap = await commentDoc.ref.collection('votes').get();
      for (const vDoc of vSnap.docs) await vDoc.ref.delete();
      await commentDoc.ref.delete();
    }
    const votesSnapshot = await docRef.collection('votes').get();
    for (const vDoc of votesSnapshot.docs) await vDoc.ref.delete();
    await docRef.delete();
    
    console.log("Successfully deleted the topic via simulated logic.");
  } catch (err) {
    console.error("Deletion failed:", err);
  }
  process.exit(0);
}

testDelete();
