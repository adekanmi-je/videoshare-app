const { app } = require('@azure/functions');
const { users } = require('../shared/db');
const { checkPassword, signToken } = require('../shared/auth');

app.http('login', {
    methods: ['POST'], authLevel: 'anonymous', route: 'login',
    handler: async (request) => {
        const body = await request.json();
        const email = (body.email || '').toLowerCase().trim();
        try {
            const { resource: user } = await users().item(email, email).read();
            if (!user || !checkPassword(body.password, user.passwordHash)) {
                return { status: 401, jsonBody: { error: 'Invalid email or password' } };
            }
            return { status: 200, jsonBody: { token: signToken(user), role: user.role, displayName: user.displayName } };
        } catch { return { status: 401, jsonBody: { error: 'Invalid email or password' } }; }
    }
});