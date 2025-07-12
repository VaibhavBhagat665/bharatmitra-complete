const admin = require('firebase-admin');
require('dotenv').config();

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
