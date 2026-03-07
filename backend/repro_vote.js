const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testVoting() {
  const testId = "test_manifesto_" + Date.now();
  const testRef = db.collection('manifestos').doc(testId);
  
  console.log("Creating test manifesto...");
  await testRef.set({ title: "Test", voteCount: 0 });

  async function vote(userId, type) {
    const voteRef = testRef.collection('votes').doc(userId);
    const voteDoc = await voteRef.get();
    let change = 0;
    
    if (voteDoc.exists) {
      if (voteDoc.data().type === type) return;
      change = type === 'UP' ? 2 : -2;
      await voteRef.update({ type });
    } else {
      change = type === 'UP' ? 1 : -1;
      await voteRef.set({ userId, type });
    }
    
    console.log(`Voting ${type} (change: ${change})`);
    await testRef.update({
      voteCount: admin.firestore.FieldValue.increment(change)
    });
  }

  await vote("user1", "UP");
  let snap = await testRef.get();
  console.log("Score after user1 UP:", snap.data().voteCount); // Should be 1

  await vote("user2", "DOWN");
  snap = await testRef.get();
  console.log("Score after user2 DOWN:", snap.data().voteCount); // Should be 0

  await vote("user1", "DOWN"); // Switch user1 from UP to DOWN
  snap = await testRef.get();
  console.log("Score after user1 switch to DOWN:", snap.data().voteCount); // Should be -2

  await testRef.delete();
  console.log("Test complete.");
  process.exit(0);
}

testVoting().catch(err => {
  console.error(err);
  process.exit(1);
});
