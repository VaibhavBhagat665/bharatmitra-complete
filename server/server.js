const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const { db, auth, admin } = require('./firebaseAdmin');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Auth middleware
const checkAuth = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(403).send('Unauthorized: No token provided');
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized: Invalid token');
    }
};

// --- Helper Functions ---
const formatFirestoreTimestamps = (docData) => {
    if (!docData) return docData;
    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof admin.firestore.Timestamp) {
            data[key] = data[key].toDate().toISOString();
        } else if (key === 'scheme_history' && Array.isArray(data[key])) {
             data[key] = data[key].map(entry => formatFirestoreTimestamps(entry));
        }
    }
    return data;
};

// --- API Routes ---

app.get('/api/user-profile', checkAuth, async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.user.uid);
        const doc = await userRef.get();
        if (!doc.exists) {
            return res.status(404).send('User profile not found.');
        }
        // Update last login timestamp in the background
        userRef.update({ last_login: admin.firestore.FieldValue.serverTimestamp() });
        
        res.status(200).json(formatFirestoreTimestamps(doc.data()));
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/api/user-profile', checkAuth, async (req, res) => {
    try {
        const { username, birthday, occupation } = req.body;
        if (!username || !birthday || !occupation) {
            return res.status(400).send('Missing required profile fields.');
        }

        const userRef = db.collection('users').doc(req.user.uid);
        await userRef.update({ username, birthday, occupation });

        const updatedDoc = await userRef.get();
        res.status(200).json(formatFirestoreTimestamps(updatedDoc.data()));
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/apply-scheme', checkAuth, async (req, res) => {
    const { scholarshipId, scholarshipName } = req.body;
    if (!scholarshipId || !scholarshipName) {
        return res.status(400).send('Missing scholarship details.');
    }
    
    const userRef = db.collection('users').doc(req.user.uid);

    try {
        const updatedProfile = await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error("User document not found!");
            }
            const userData = userDoc.data();
            const schemeHistory = userData.scheme_history || [];
            
            // Prevent duplicate applications
            if (schemeHistory.some(s => s.scheme_id === scholarshipId)) {
                return userData; // Return current data, no change
            }

            const previousHash = schemeHistory.length > 0 ? schemeHistory[schemeHistory.length - 1].hash : '0'.repeat(64);
            const appliedOn = admin.firestore.Timestamp.now();

            const newEntry = {
                scheme_id: scholarshipId,
                scheme_name: scholarshipName,
                applied_on: appliedOn,
                status: 'applied',
            };
            
            // Create hash for new entry
            const hashInput = `${previousHash}${newEntry.scheme_id}${newEntry.scheme_name}${newEntry.applied_on.toMillis()}`;
            const currentHash = crypto.createHash('sha256').update(hashInput).digest('hex');
            newEntry.hash = currentHash;

            const newSchemeHistory = [...schemeHistory, newEntry];
            const newTokens = (userData.bharat_tokens || 0) + 5; // Award 5 tokens

            transaction.update(userRef, { 
                scheme_history: newSchemeHistory,
                bharat_tokens: newTokens
            });

            return { ...userData, scheme_history: newSchemeHistory, bharat_tokens: newTokens };
        });

        res.status(200).json(formatFirestoreTimestamps(updatedProfile));
    } catch (error) {
        console.error("Error in apply-scheme transaction:", error);
        res.status(500).send('Failed to apply for scheme.');
    }
});


app.post('/api/reward-tokens', checkAuth, async(req, res) => {
    const { amount, reason } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).send('Invalid token amount');
    }

    try {
        const userRef = db.collection('users').doc(req.user.uid);
        await userRef.update({ bharat_tokens: admin.firestore.FieldValue.increment(amount) });
        const userDoc = await userRef.get();
        const newTotal = userDoc.data().bharat_tokens;
        res.status(200).json({ message: 'Tokens awarded', newTotal });
    } catch (error) {
        console.error(`Error rewarding tokens for ${reason}:`, error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/api/redeem-perk', checkAuth, async (req, res) => {
    const { perkId, price } = req.body;
    if (!perkId || typeof price !== 'number' || price <= 0) {
        return res.status(400).send('Invalid perk details.');
    }
    
    const userRef = db.collection('users').doc(req.user.uid);

    try {
        const updatedData = await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error("User not found.");

            const currentTokens = userDoc.data().bharat_tokens || 0;
            if (currentTokens < price) {
                throw new Error("Insufficient funds.");
            }
            
            const newTotal = currentTokens - price;
            transaction.update(userRef, { bharat_tokens: newTotal });
            return { newTotal };
        });
        
        res.status(200).json({ message: 'Redemption successful', newTotal: updatedData.newTotal });
    } catch (error) {
        if (error.message === 'Insufficient funds.') {
            return res.status(402).send(error.message);
        }
        console.error("Error in redeem-perk transaction:", error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Bharat Mitra server listening on port ${port}`);
});
