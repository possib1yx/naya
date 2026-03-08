const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env variable:', error);
    serviceAccount = require('../firebase-service-account.json');
  }
} else {
  serviceAccount = require('../firebase-service-account.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

console.log('Successfully connected to Firebase Firestore');

module.exports = db;
