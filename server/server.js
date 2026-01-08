const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const { db, auth, admin } = require('./firebaseAdmin');

const app = express();
const port = process.env.PORT || 8080;

const clientOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173','http://localhost:3000'];
app.use(cors({ origin: clientOrigins }));
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

app.post('/api/llm/answer', async (req, res) => {
    try {
        const { query, lang, system_instruction, urls } = req.body || {};
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Missing query' });
        }

        const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN || process.env.HF_TOKEN;
        const HF_MODEL_ID = process.env.HF_MODEL_ID || 'google/gemma-2-2b-it';
        if (!HF_API_TOKEN) {
            return res.status(500).json({ error: 'LLM not configured' });
        }

        const safeUrls = Array.isArray(urls) ? urls.filter(u => /^https?:\/\//i.test(u)).slice(0, 3) : [];
        let contextText = '';
        for (const u of safeUrls) {
            try {
                const r = await fetch(u, { headers: { 'User-Agent': 'BharatMitraBot/1.0' } });
                const html = await r.text();
                const cleaned = html
                    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 5000);
                contextText += `\n\nSource: ${u}\n${cleaned}`;
            } catch (e) { /* ignore per-URL errors */ }
        }

        const instruction = (typeof system_instruction === 'string' && system_instruction.trim().length > 0)
            ? system_instruction
            : `You are a helpful assistant for Indian government schemes. Reply in ${lang === 'hi' ? 'Hindi (Devanagari)' : 'English'} with simple, factual information.`;

        const inputs = `${instruction}\n\n${contextText ? 'Use the following source excerpts to answer accurately:\n' + contextText + '\n\n' : ''}User question: ${query}\nAnswer:`;

        const hfRes = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL_ID)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs,
                parameters: {
                    max_new_tokens: 600,
                    temperature: 0.3,
                    return_full_text: false
                }
            })
        });

        if (hfRes.status === 503) {
            const data = await hfRes.json().catch(() => ({}));
            return res.status(503).json({ error: 'Model loading, try again', details: data });
        }

        if (!hfRes.ok) {
            const text = await hfRes.text().catch(() => '');
            return res.status(500).json({ error: 'LLM request failed', details: text });
        }

        const data = await hfRes.json();
        let textOut = '';
        if (Array.isArray(data) && data[0]?.generated_text) {
            textOut = data[0].generated_text;
        } else if (typeof data?.generated_text === 'string') {
            textOut = data.generated_text;
        } else if (typeof data === 'string') {
            textOut = data;
        } else {
            textOut = JSON.stringify(data);
        }

        textOut = textOut
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .trim();

        res.json({ text: textOut });
    } catch (err) {
        res.status(500).json({ error: 'Internal error' });
    }
});

app.listen(port, () => {
    console.log(`Bharat Mitra server listening on port ${port}`);
});
