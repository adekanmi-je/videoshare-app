const { CosmosClient } = require('@azure/cosmos');
let client;
function getClient() {
    if (!client) client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    return client;
}
function getDatabase() { return getClient().database('videoshare'); }
module.exports = {
    users: () => getDatabase().container('Users'),
    videos: () => getDatabase().container('Videos'),
    comments: () => getDatabase().container('Comments')
};