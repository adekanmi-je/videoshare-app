const { app } = require('@azure/functions');
const { users } = require('../shared/db');
const { hashPassword, signToken } = require('../shared/auth');

app.http('register', {
    methods: ['POST'], authLevel: 'anonymous', route: 'register',
    handler: async (request) => {
        const body = await request.json();
        const email = (body.email || '').toLowerCase().trim();
        const { password, displayName } = body;
        if (!email || !password || !displayName) {
            return { status: 400, jsonBody: { error: 'email, password and displayName are required' } };
        }
        const container = users();
        const { resources: existing } = await container.items
            .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: email }] }).fetchAll();
        if (existing.length > 0) return { status: 409, jsonBody: { error: 'An account with that email already exists' } };

        const user = { id: email, role: 'consumer', displayName, passwordHash: hashPassword(password), createdAt: new Date().toISOString() };
        await container.items.create(user);
        return { status: 201, jsonBody: { token: signToken(user), role: user.role, displayName: user.displayName } };
    }
});