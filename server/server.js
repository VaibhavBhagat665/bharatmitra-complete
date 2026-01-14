const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const { db, auth, admin } = require('./firebaseAdmin');

const app = express();
const port = process.env.PORT || 8080;

const clientOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
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


app.post('/api/reward-tokens', checkAuth, async (req, res) => {
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

const puppeteer = require('puppeteer');

// ... (keep previous code)

app.post('/api/llm/answer', async (req, res) => {
    try {
        const { query, lang, system_instruction } = req.body || {};
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Missing query' });
        }

        console.log(`[LLM] Processing query: "${query}" in language: ${lang}`);

        const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN || process.env.HF_TOKEN;
        const HF_MODEL_ID = process.env.HF_MODEL_ID || 'google/gemma-2-2b-it';

        if (!HF_API_TOKEN) {
            console.error('LLM API Token missing');
            return res.status(500).json({ error: 'LLM not configured' });
        }

        let contextText = ''; // Initialize contextText
        let browser; // Declare browser here to be accessible in finally
        let scrapedUrl = ''; // Store the valid URL

        // --- Step 1: Browse myScheme.gov.in for live context ---
        // We wrap this in a separate try-catch so it doesn't block the main LLM response if it fails.
        try {
            console.log('[Puppeteer] Launching browser...');
            // Try launching with minimal args first
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
            const page = await browser.newPage();

            // Simple query cleaner to improve search relevance
            // Removes conversational filler like "I need", "show me", "help with"
            const cleanQuery = query.replace(/\b(I need|I want|I am|show me|give me|help me|looking for|schemes for|how to apply|benefits of)\b/gi, '').trim();
            // Fallback to original if aggressive cleaning leaves nothing
            const finalQuery = cleanQuery.length > 2 ? cleanQuery : query;

            const searchUrl = `https://www.myscheme.gov.in/search?query=${encodeURIComponent(finalQuery)}`;
            console.log(`[Puppeteer] Navigating to: ${searchUrl} (Cleaned from: "${query}")`);
            console.log(`[Puppeteer] Navigating to: ${searchUrl}`);

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

            // Moderate timeout
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

            console.log('[Puppeteer] Search page loaded, looking for results...');
            let listText = '';

            try {
                // Wait for the results grid
                await page.waitForSelector('main', { timeout: 8000 });

                // --- CAPTURE LIST CONTEXT FIRST ---
                listText = await page.evaluate(() => {
                    // Extract titles of the first few results to give breadth
                    const cards = Array.from(document.querySelectorAll('div.cursor-pointer, a[href*="/schemes/"]')).slice(0, 5);
                    return cards.map((c, i) => `Result ${i + 1}: ${c.innerText.split('\n')[0]}`).join('\n');
                });
                console.log(`[Puppeteer] Captured list context: ${listText.slice(0, 100)}...`);

                // Click logic: Find first link to a scheme
                const elementToClick = await page.evaluateHandle(() => {
                    // Try to find a link to a scheme detail page
                    const schemeLinks = Array.from(document.querySelectorAll('a[href*="/schemes/"]'));
                    if (schemeLinks.length > 0) return schemeLinks[0];
                    // Fallback: Click the first cursor-pointer div
                    const cards = document.querySelectorAll('div.cursor-pointer');
                    return cards[0];
                });

                if (elementToClick) {
                    console.log('[Puppeteer] Found a scheme result, clicking...');
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
                        elementToClick.click()
                    ]);
                    console.log('[Puppeteer] Navigated to scheme details page.');
                } else {
                    console.log('[Puppeteer] No clickable result found, staying on search page.');
                }

            } catch (e) {
                console.log('[Puppeteer] Navigation step failed or timed out:', e.message);
                // Continue with whatever page we are on
            }

            // Extract text from the current page
            const { pageText, currentUrl } = await page.evaluate(() => {
                const scripts = document.querySelectorAll('script, style, nav, footer, header');
                scripts.forEach(s => s.remove());
                const main = document.querySelector('main') || document.body;
                return {
                    pageText: main.innerText.slice(0, 12000),
                    currentUrl: window.location.href
                };
            });

            if (pageText && pageText.length > 200) {
                console.log(`[Puppeteer] Successfully extracted ${pageText.length} chars from ${currentUrl}`);
                scrapedUrl = currentUrl;
                contextText += `\n\n--- OVERVIEW OF SEARCH RESULTS ---\n${listText}\n\n--- DETAILED CONTENT OF TOP RESULT (${currentUrl}) ---\n${pageText}`;
            } else {
                console.log('[Puppeteer] No significant text found.');
            }

        } catch (pupError) {
            console.error('[Puppeteer] Scraping failed (using fallback):', pupError.message);
            // Verify log to file for debugging if needed, but don't crash
            // contextText remains empty or has error note
            contextText += `\n(Note: Live government scheme search failed momentarily, using internal knowledge.)`;
        } finally {
            if (browser) {
                try { await browser.close(); } catch (e) { }
            }
        }

        // --- Step 2: Call LLM ---
        const instruction = (typeof system_instruction === 'string' && system_instruction.trim().length > 0)
            ? system_instruction
            : `You are a helpful assistant for Indian government schemes. Reply in ${lang === 'hi' ? 'Hindi (Devanagari)' : 'English'}.`;

        console.log(`[LLM] Context length: ${contextText.length} chars`);

        // Prompt engineering: clearly separate context from user query
        const inputs = `
${instruction}

CONTEXT FROM OFFICIAL GOVERNMENT PORTAL (Actual Live Data):
${contextText}

VERIFIED SOURCE URL: ${scrapedUrl || "None found"}

USER QUERY: ${query}

instructions:
- Use the provided CONTEXT to answer the question accurately.
- REQUIRED: Remove any internal reasoning or <think> tags from your response.
- CRITICAL: DO NOT provide direct URL links to specific pages (they often break).
- INSTEAD: Mention the "Official Portal Name" (e.g., myScheme, PM Kisan Portal).
- REQUIRED: Provide a "How to Apply / Where to Find" section with clear steps (e.g., "1. Visit myscheme.gov.in", "2. Search for [Scheme Name]", "3. Click on Apply").
- Use the context to explain eligibility and documents needed.
- If no schemes are found, give general advice.
- Keep the answer helpful and encouraging.
- Answer in ${lang === 'hi' ? 'Hindi' : 'English'}.

Answer:
`;


        const hfRes = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: `${HF_MODEL_ID}:hf-inference`,
                messages: [
                    { role: 'user', content: inputs }
                ],
                max_tokens: 2000,
                temperature: 0.3
            })
        });

        if (hfRes.status === 503) {
            const data = await hfRes.json().catch(() => ({}));
            return res.status(503).json({ error: 'Model loading, try again', details: data });
        }

        if (!hfRes.ok) {
            const text = await hfRes.text().catch(() => '');
            console.error('LLM Fetch Error:', text);
            return res.status(500).json({ error: 'LLM request failed', details: text });
        }

        const data = await hfRes.json();
        let textOut = '';
        if (data?.choices?.[0]?.message?.content) {
            textOut = data.choices[0].message.content;
        } else {
            textOut = JSON.stringify(data);
        }

        // Clean output
        textOut = textOut
            .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove reasoning blocks
            .replace(/\*\*(.*?)\*\*/g, '$1') // Bold keys
            .replace(/\*(.*?)\*/g, '$1') // Italic keys
            .replace(/__(.*?)__/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/#{1,6}\s/g, '') // Headers
            .trim();

        if (textOut.length === 0) {
            textOut = "I apologize, I couldn't generate a clear answer. Please try asking again.";
        }

        res.json({ text: textOut });

    } catch (err) {
        console.error('Overall Error:', err);
        require('fs').writeFileSync('server_error.log', `[${new Date().toISOString()}] ${err.stack || err}\n`, { flag: 'a' });
        res.status(500).json({ error: 'Internal error' });
    }
});

app.listen(port, () => {
    console.log(`Bharat Mitra server listening on port ${port}`);
});
