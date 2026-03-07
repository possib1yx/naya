const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function seedTopComments() {
  console.log("Seeding test comments for daily top...");
  
  const manifestosSnapshot = await db.collection('manifestos').limit(2).get();
  if (manifestosSnapshot.empty) {
    console.log("No manifestos found. Run seed_balen_manifestos.js first.");
    process.exit(0);
  }

  const testComments = [
    { content: "We need more bike lanes in Nepal to reduce traffic and pollution.", authorName: "Sagar P.", voteCount: 452, isAnonymous: false },
    { content: "Digital ID for every citizen will solve 50% of corruption.", authorName: "Binayak B.", voteCount: 321, isAnonymous: false },
    { content: "Waste to energy plants are the only solution for garbage.", authorName: "Anita K.", voteCount: 289, isAnonymous: false }
  ];

  for (let i = 0; i < testComments.length; i++) {
    const manifestoId = manifestosSnapshot.docs[i % manifestosSnapshot.size].id;
    const commentRef = db.collection('manifestos').doc(manifestoId).collection('comments').doc();
    await commentRef.set({
      ...testComments[i],
      manifestoId,
      userId: "TEST_USER",
      createdAt: new Date().toISOString()
    });
    
    // Update comment count
    await db.collection('manifestos').doc(manifestoId).update({
      commentCount: admin.firestore.FieldValue.increment(1)
    });
    
    console.log(`Added comment to ${manifestoId}: ${testComments[i].content}`);
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seedTopComments().catch(err => {
  console.error(err);
  process.exit(1);
});
