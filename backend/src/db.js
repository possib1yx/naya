const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const serviceAccount = require('../firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

console.log('Successfully connected to Firebase Firestore');

module.exports = db;
