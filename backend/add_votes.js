const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function addVotesToManifestos() {
  console.log("Adding votes to manifestos...");
  
  const snapshot = await db.collection('manifestos').limit(3).get();
  if (snapshot.empty) {
    console.log("No manifestos found.");
    process.exit(0);
  }

  const votes = [1520, 945, 612];
  
  for (let i = 0; i < snapshot.docs.length; i++) {
    const doc = snapshot.docs[i];
    await doc.ref.update({
      voteCount: votes[i] || 100
    });
    console.log(`Updated ${doc.id} with ${votes[i]} votes.`);
  }
  
  console.log("Voting complete!");
  process.exit(0);
}

addVotesToManifestos().catch(err => {
  console.error(err);
  process.exit(1);
});
