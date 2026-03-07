const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const manifestoPoints = [
  {
    title: "Education Quality & Technical Priority",
    description: "To improve infrastructure, quality and environment of community schools and to give priority on technical education.",
    category: "Education"
  },
  {
    title: "Smart Ambulance Call Center",
    description: "To start ambulance, having all kinds of facilities, services under the Kathmandu Metropolitan City and to operate the services through call center.",
    category: "Health"
  },
  {
    title: "Elderly Health Home Checkups",
    description: "To conduct free home to home free health check-up for the people above 70 years of age.",
    category: "Health"
  },
  {
    title: "Physical Infrastructure Ambulance",
    description: "Roads, drainages and sewages among others will be repaired by physical infrastructure ambulances through call center.",
    category: "Infrastructure"
  },
  {
    title: "GPS Tracking for Transportation",
    description: "To connect GPS in all public transportation to track the location of vehicles.",
    category: "Transportation"
  },
  {
    title: "Reviving Heritage Water Resources",
    description: "To revive old water resources to bring stone spout, Dhungedhara in Nepali and Hiti in Nepal bhasa into use.",
    category: "Heritage"
  },
  {
    title: "CCTV in Public Vehicles",
    description: "To install CCTV in all public vehicles for security reasons.",
    category: "Security"
  },
  {
    title: "Public Toilets in Every Ward",
    description: "To establish public toilets in all wards.",
    category: "Sanitation"
  },
  {
    title: "Employment Idea Bank",
    description: "To establish idea bank for employment and entrepreneurship promotion.",
    category: "Economy"
  },
  {
    title: "One House One Tree Campaign",
    description: "To launch one house one tree campaign.",
    category: "Environment"
  }
];

async function updateManifestos() {
  console.log("Cleaning up previous system manifestos...");
  const snapshot = await db.collection('manifestos').where('createdById', '==', 'SYSTEM').get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Deleted ${snapshot.size} previous items.`);

  console.log("Re-seeding Balen's manifesto points with numbered titles...");
  
  for (let i = 0; i < manifestoPoints.length; i++) {
    const point = manifestoPoints[i];
    const docRef = db.collection('manifestos').doc();
    await docRef.set({
      ...point,
      title: `[Balen Manifesto #${i + 1}] ${point.title}`,
      createdById: "SYSTEM",
      createdAt: new Date().toISOString(),
      commentCount: 0,
      voteCount: 0
    });
    console.log(`Added: [Balen Manifesto #${i + 1}] ${point.title}`);
  }
  
  console.log("Update complete!");
  process.exit(0);
}

updateManifestos().catch(err => {
  console.error(err);
  process.exit(1);
});
