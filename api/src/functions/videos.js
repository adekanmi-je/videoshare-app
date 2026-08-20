const { app } = require('@azure/functions');
const { v4: uuidv4 } = require('uuid');
const { videos } = require('../shared/db');
const { getUserFromRequest } = require('../shared/auth');
const { getUploadSasUrl } = require('../shared/blob');

app.http('videosList', {
    methods: ['GET'], authLevel: 'anonymous', route: 'videos',
    handler: async (request) => {
        const search = request.query.get('search');
        const genre = request.query.get('genre');
        let query = 'SELECT * FROM c WHERE c.status = "ready"';
        const parameters = [];
        if (search) { query += ' AND CONTAINS(LOWER(c.title), @search)'; parameters.push({ name: '@search', value: search.toLowerCase() }); }
        if (genre) { query += ' AND c.genre = @genre'; parameters.push({ name: '@genre', value: genre }); }
        query += ' ORDER BY c.uploadedAt DESC';
        const { resources } = await videos().items.query({ query, parameters }).fetchAll();
        return { status: 200, jsonBody: resources };
    }
});

app.http('videosCreate', {
    methods: ['POST'], authLevel: 'anonymous', route: 'videos',
    handler: async (request) => {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'creator') return { status: 403, jsonBody: { error: 'Only creator accounts can upload videos' } };
        const body = await request.json();
        const { title, publisher, producer, genre, ageRating } = body;
        if (!title || !genre || !ageRating) return { status: 400, jsonBody: { error: 'title, genre and ageRating are required' } };

        const id = uuidv4();
        const blobName = `${id}.mp4`;
        const video = { id, title, publisher: publisher || '', producer: producer || '', genre, ageRating,
            creatorId: user.sub, creatorName: user.displayName, blobName, status: 'pending',
            uploadedAt: new Date().toISOString(), viewCount: 0 };
        await videos().items.create(video);
        return { status: 201, jsonBody: { video, uploadUrl: getUploadSasUrl(blobName) } };
    }
});