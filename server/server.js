const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const { db, auth, admin } = require('./firebaseAdmin');

// Groq API Configuration (groq.com)
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const app = express();
const port = process.env.PORT || 8080;

const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://bharatmitra-complete.vercel.app'];
const envOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : [];
const clientOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

console.log('Allowed CORS Origins:', clientOrigins);

app.use(cors({
    origin: clientOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.options('*', cors({ origin: clientOrigins }));
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

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// LLM Answer endpoint - SIMPLIFIED (no scraping)
app.post('/api/llm/answer', async (req, res) => {
    try {
        const { query, lang, system_instruction } = req.body || {};
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Missing query' });
        }

        console.log(`[LLM] Processing query: "${query}" in language: ${lang}`);

        // Build reference URL (no scraping, just provide as context)
        const searchUrl = `https://www.myscheme.gov.in/search?query=${encodeURIComponent(query)}`;

        // Build prompt with URL reference
        const instruction = (typeof system_instruction === 'string' && system_instruction.trim().length > 0)
            ? system_instruction
            : `You are a helpful assistant for Indian government schemes. Reply in ${lang === 'hi' ? 'Hindi (Devanagari)' : 'English'}.`;

        const inputs = `${instruction}

USER QUESTION: ${query}

REFERENCE: For official information, users can visit ${searchUrl}

Instructions:
- Use your knowledge about Indian government schemes
- Provide scheme names, eligibility, documents needed, and how to apply
- Suggest checking myscheme.gov.in, PM Kisan Portal, or other official sources for latest details
- DO NOT provide direct clickable URL links in your response
- Provide guidance on how to navigate to official portals
- Answer in ${lang === 'hi' ? 'Hindi' : 'English'}

Answer:
`;

        // Call Groq API (groq.com)
        console.log('[LLM] Calling Groq API with Llama 3.1 8B Instant...');

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'user', content: inputs }
                ],
                max_tokens: 1000,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[LLM] Groq API response:', JSON.stringify(data).substring(0, 200));
        let textOut = data.choices?.[0]?.message?.content || '';
        console.log('[LLM] Extracted text:', textOut.substring(0, 100));

        // Clean output
        textOut = textOut
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .trim();

        if (textOut.length === 0) {
            textOut = "I apologize, I couldn't generate a clear answer. Please try asking again.";
        }

        console.log('[LLM] Sending response with length:', textOut.length);
        res.json({ text: textOut });

    } catch (error) {
        console.error('[LLM] Error:', error.message);
        res.status(500).json({ error: 'Internal error', details: error.message });
    }
});

// User profile endpoints
app.get('/api/user-profile', checkAuth, async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.user.uid);
        const doc = await userRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const data = formatFirestoreTimestamps(doc.data());
        res.json(data);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/user-profile', checkAuth, async (req, res) => {
    try {
        const { name, location, category } = req.body;
        const userRef = db.collection('users').doc(req.user.uid);
        await userRef.set({
            uid: req.user.uid,
            email: req.user.email,
            name: name || '',
            location: location || '',
            category: category || '',
            tokens: 200,
            schemes_used: 0,
            scheme_history: [],
            created_at: admin.firestore.Timestamp.now()
        }, { merge: true });
        const doc = await userRef.get();
        res.json(formatFirestoreTimestamps(doc.data()));
    } catch (error) {
        console.error('Error creating user profile:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/schemes/apply', checkAuth, async (req, res) => {
    try {
        const { schemeId, schemeName } = req.body;
        const userRef = db.collection('users').doc(req.user.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userDoc.data();
        const historyEntry = {
            scheme_id: schemeId,
            scheme_name: schemeName,
            applied_at: admin.firestore.Timestamp.now(),
            status: 'applied'
        };
        await userRef.update({
            scheme_history: admin.firestore.FieldValue.arrayUnion(historyEntry),
            schemes_used: (userData.schemes_used || 0) + 1
        });
        res.json({ success: true, message: 'Scheme application recorded' });
    } catch (error) {
        console.error('Error applying to scheme:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tokens/reward', checkAuth, async (req, res) => {
    try {
        const { action } = req.body;
        let reward = 0;
        switch (action) {
            case 'scheme_applied': reward = 10; break;
            case 'profile_complete': reward = 20; break;
            case 'daily_login': reward = 5; break;
            default: reward = 0;
        }
        if (reward > 0) {
            const userRef = db.collection('users').doc(req.user.uid);
            await userRef.update({
                tokens: admin.firestore.FieldValue.increment(reward)
            });
            res.json({ success: true, reward, message: `+${reward} tokens!` });
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error rewarding tokens:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Bharat Mitra server listening on port ${port}`);
});
