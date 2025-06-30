const admin = require('firebase-admin');
require('dotenv').config();

// The user needs to set GOOGLE_APPLICATION_CREDENTIALS in their .env file
// pointing to their service account key file. The SDK will automatically pick it up.
// Obtain this file from Firebase Console > Project Settings > Service accounts > Generate new private key
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    console.log("Please ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set correctly in a .env file.");
    process.exit(1);
}


const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin };
