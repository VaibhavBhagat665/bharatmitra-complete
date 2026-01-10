const admin = require('firebase-admin');
require('dotenv').config();

let initialized = false;
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    initialized = true;
    console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
    console.warn("Firebase Admin SDK initialization warning:", error.message);
    console.warn("If you are not using Firebase features right now, the server will continue without Firestore/Auth.");
}


const db = initialized ? admin.firestore() : null;
const auth = initialized ? admin.auth() : null;

module.exports = { db, auth, admin };
