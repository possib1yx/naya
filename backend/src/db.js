const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const fs = require('fs');
let serviceAccount;

const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase credentials loaded from environment variable');
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env variable:', error);
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
      console.log('Falling back to local firebase-service-account.json after parse error');
    } else {
      throw new Error('FIREBASE_SERVICE_ACCOUNT env variable is invalid and firebase-service-account.json is missing');
    }
  }
} else if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = require(serviceAccountPath);
  console.log('Firebase credentials loaded from local JSON file');
} else {
  const errorMsg = 'CRITICAL: Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT environment variable or provide firebase-service-account.json';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

console.log('Successfully connected to Firebase Firestore');

module.exports = db;
