const { app } = require('@azure/functions');
const { videos, comments } = require('../shared/db');
const { getUserFromRequest } = require('../shared/auth');
const { getPublicUrl } = require('../shared/blob');

app.http('videoGet', {
    methods: ['GET'], authLevel: 'anonymous', route: 'videos/{id}',
    handler: async (request) => {
        const id = request.params.id;
        const { resource: video } = await videos().item(id, id).read();
        if (!video) return { status: 404, jsonBody: { error: 'Not found' } };
        const { resources: videoComments } = await comments().items
            .query({ query: 'SELECT * FROM c WHERE c.videoId = @id ORDER BY c.createdAt DESC', parameters: [{ name: '@id', value: id }] }).fetchAll();
        const rated = videoComments.filter((c) => typeof c.rating === 'number');
        const avgRating = rated.length ? rated.reduce((s, c) => s + c.rating, 0) / rated.length : null;
        return { status: 200, jsonBody: { ...video, playbackUrl: getPublicUrl(video.blobName), comments: videoComments, avgRating } };
    }
});

app.http('videoConfirmUpload', {
    methods: ['PATCH'], authLevel: 'anonymous', route: 'videos/{id}/confirm',
    handler: async (request) => {
        const user = getUserFromRequest(request);
        const id = request.params.id;
        const { resource: video } = await videos().item(id, id).read();
        if (!video) return { status: 404, jsonBody: { error: 'Not found' } };
        if (!user || video.creatorId !== user.sub) return { status: 403, jsonBody: { error: 'Not your video' } };
        video.status = 'ready';
        await videos().item(id, id).replace(video);
        return { status: 200, jsonBody: video };
    }
});