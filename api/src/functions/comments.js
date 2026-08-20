const { app } = require('@azure/functions');
const { v4: uuidv4 } = require('uuid');
const { comments } = require('../shared/db');
const { getUserFromRequest } = require('../shared/auth');

app.http('commentsAdd', {
    methods: ['POST'], authLevel: 'anonymous', route: 'videos/{id}/comments',
    handler: async (request) => {
        const user = getUserFromRequest(request);
        if (!user) return { status: 401, jsonBody: { error: 'Login required' } };
        const videoId = request.params.id;
        const body = await request.json();
        const { text, rating } = body;
        if (!text && typeof rating !== 'number') return { status: 400, jsonBody: { error: 'Provide a comment and/or a rating (1-5)' } };
        if (typeof rating === 'number' && (rating < 1 || rating > 5)) return { status: 400, jsonBody: { error: 'rating must be between 1 and 5' } };

        const comment = { id: uuidv4(), videoId, userId: user.sub, displayName: user.displayName,
            text: text || null, rating: typeof rating === 'number' ? rating : null, createdAt: new Date().toISOString() };
        await comments().items.create(comment);
        return { status: 201, jsonBody: comment };
    }
});