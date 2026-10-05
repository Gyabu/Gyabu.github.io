const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const rateLimitByIp = new Map();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/g;

function clean(value) {
    return typeof value === 'string' ? value.replace(CONTROL_CHARACTERS, '').trim() : '';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    if (typeof body.website === 'string' && body.website.trim()) {
        return res.status(200).json({ ok: true });
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
        req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const recentRequests = (rateLimitByIp.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);

    if (recentRequests.length >= RATE_LIMIT) {
        rateLimitByIp.set(ip, recentRequests);
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    recentRequests.push(now);
    rateLimitByIp.set(ip, recentRequests);
    if (rateLimitByIp.size > 1000) {
        for (const [address, timestamps] of rateLimitByIp) {
            if (!timestamps.some((timestamp) => now - timestamp < RATE_WINDOW_MS)) {
                rateLimitByIp.delete(address);
            }
        }
    }

    const name = clean(body.name);
    const email = clean(body.email);
    const message = clean(body.message);

    if (name.length < 1 || name.length > 100) {
        return res.status(400).json({ error: 'Name must be between 1 and 100 characters' });
    }
    if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (message.length < 10 || message.length > 2000) {
        return res.status(400).json({ error: 'Message must be between 10 and 2000 characters' });
    }

    const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim();
    const CONTACT_TO = (process.env.CONTACT_TO || '').trim();
    const CONTACT_FROM = (process.env.CONTACT_FROM || '').trim();
    const missingVariables = [
        ['RESEND_API_KEY', RESEND_API_KEY],
        ['CONTACT_TO', CONTACT_TO],
        ['CONTACT_FROM', CONTACT_FROM]
    ].filter(([, value]) => !value).map(([name]) => name);

    if (missingVariables.length) {
        console.error('Contact API missing environment variables:', missingVariables);
        return res.status(500).json({ error: 'Server not configured' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: CONTACT_FROM,
                to: [CONTACT_TO],
                reply_to: email,
                subject: `Portfolio contact from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\n${message}`
            })
        });

        if (!response.ok) {
            const providerError = await response.json().catch(() => ({}));
            console.error('Resend request failed', {
                status: response.status,
                message: providerError.message
            });
            return res.status(502).json({ error: 'Email provider rejected the request' });
        }

        return res.status(200).json({ ok: true });
    } catch {
        return res.status(502).json({ error: 'Email provider rejected the request' });
    }
}
