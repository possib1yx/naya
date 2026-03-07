const db = require('./src/db');

const seedVisions = [
  {
    title: "The Tukucha Restoration Project",
    description: "Reclaiming and restoring the lost Tukucha stream to its natural course, creating urban green corridors and enhancing the valley's aesthetic and environmental health.",
    category: "Environment",
    voteCount: 142,
    commentCount: 98,
    createdById: "system-seed",
    createdAt: new Date().toISOString()
  },
  {
    title: "Waste-to-Energy: Kathmandu's Scientific Disposal",
    description: "Transitioning from Bancharedanda landfill dependency to a fully decentralized waste-to-energy system within the valley, focusing on source segregation and plasma gasification.",
    category: "Waste Management",
    voteCount: 185,
    commentCount: 124,
    createdById: "system-seed",
    createdAt: new Date().toISOString()
  },
  {
    title: "Digital Ward: paperless Local Governance",
    description: "Digitalizing all 32 Wards of Kathmandu Metropolitan City to ensure all recommendations, certificates, and taxes can be processed from a smartphone.",
    category: "e-Governance",
    voteCount: 96,
    commentCount: 65,
    createdById: "system-seed",
    createdAt: new Date().toISOString()
  },
  {
    title: "Pedestrian-First Infrastructure & Footpath Widening",
    description: "Prioritizing pedestrians over private vehicles by widening footpaths, clearing illegal encroachments, and creating wheel-chair friendly zones across the core city.",
    category: "Infrastructure",
    voteCount: 118,
    commentCount: 82,
    createdById: "system-seed",
    createdAt: new Date().toISOString()
  },
  {
    title: "Metro Health: Free Screenings & Lab Tests",
    description: "Establishing advanced Metropolitan health clinics in every ward to provide free basic lab tests and regular screenings for senior citizens and low-income residents.",
    category: "Health",
    voteCount: 156,
    commentCount: 94,
    createdById: "system-seed",
    createdAt: new Date().toISOString()
  },
  {
    title: "Public School Infrastructure & Technology Upgrade",
    description: "Transforming all Kathmandu community schools with modern labs, computer education, and specialized extracurricular programs to match private education standards.",
    category: "Education",
    voteCount: 89,
    commentCount: 52,
    createdById: "system-seed",
    createdAt: new Date().toISOString()
  },
  {
    title: "Heritage Conservation and Heritage Bus Routes",
    description: "Protecting traditional stonespouts (Hitis) and temples while launching dedicated electric bus routes that link all major UNESCO World Heritage sites in the valley.",
    category: "Culture",
    voteCount: 74,
    commentCount: 41,
    createdById: "system-seed",
    createdAt: new Date().toISOString()
  }
];

const seedComments = [
  // 0: The Tukucha Restoration Project
  {
    content: "Restoring the stream is a bold move. It will finally solve the drainage issues in the Hattisar area.",
    voteCount: 22,
    isAnonymous: false,
    authorName: "Sagar P.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    visionIndex: 0
  },
  {
    content: "We need more open spaces and green corridors. This is what a modern city looks like.",
    voteCount: 15,
    isAnonymous: false,
    authorName: "Anjali T.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    visionIndex: 0
  },

  // 1: Waste-to-Energy
  {
    content: "Source segregation is key! If we don't separate plastic and organic waste, no machine can solve this.",
    voteCount: 34,
    isAnonymous: false,
    authorName: "Binaya K.",
    createdAt: new Date().toISOString(),
    visionIndex: 1
  },
  {
    content: "Finally a scientific approach instead of just dumping garbage in other districts.",
    voteCount: 28,
    isAnonymous: true,
    authorName: "Anonymous Citizen",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    visionIndex: 1
  },

  // 2: Digital Ward
  {
    content: "No more queues at the Ward office. This will reduce corruption significantly.",
    voteCount: 19,
    isAnonymous: false,
    authorName: "Ram K.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    visionIndex: 2
  },

  // 3: Pedestrian-First Infrastructure
  {
    content: "Walking in Kathmandu was a nightmare. The wider footpaths are making the city breathable again.",
    voteCount: 42,
    isAnonymous: false,
    authorName: "Sita M.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    visionIndex: 3
  },

  // 4: Metro Health
  {
    content: "Free lab tests for elderly citizens is a blessing. Every city in Nepal should follow Balen's model here.",
    voteCount: 56,
    isAnonymous: false,
    authorName: "Dr. Aryan",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    visionIndex: 4
  },

  // 5: Public School Upgrade
  {
    content: "The quality of public schools is the real benchmark of a city's progress. Great focus on digital labs.",
    voteCount: 31,
    isAnonymous: false,
    authorName: "Teacher Sunita",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    visionIndex: 5
  }
];

async function seed() {
  console.log('Seeding high-quality visions and related comments...');
  
  // Clear existing data (OPTIONAL - but helpful for clean state)
  // await db.collection('manifestos').get().then(snap => snap.forEach(doc => doc.ref.delete()));
  // await db.collection('comments').get().then(snap => snap.forEach(doc => doc.ref.delete()));

  for (const v of seedVisions) {
    const visionIdx = seedVisions.indexOf(v);
    const relatedComments = seedComments.filter(c => c.visionIndex === visionIdx);
    
    // Set actual comment count in vision data
    const manifestoData = {
        ...v,
        commentCount: relatedComments.length
    };

    const vRef = db.collection('manifestos').doc();
    await vRef.set(manifestoData);
    
    for (const c of relatedComments) {
      const { visionIndex, ...cData } = c;
      const cRef = db.collection('comments').doc();
      await cRef.set({
        ...cData,
        manifestoId: vRef.id,
        userId: "system-seed"
      });
    }
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
