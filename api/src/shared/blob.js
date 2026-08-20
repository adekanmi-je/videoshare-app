const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const CONTAINER_NAME = 'videos';

function getCredential() {
    return new StorageSharedKeyCredential(process.env.STORAGE_ACCOUNT_NAME, process.env.STORAGE_ACCOUNT_KEY);
}
function getUploadSasUrl(blobName) {
    const account = process.env.STORAGE_ACCOUNT_NAME;
    const expiresOn = new Date(Date.now() + 15 * 60 * 1000);
    const sas = generateBlobSASQueryParameters(
        { containerName: CONTAINER_NAME, blobName, permissions: BlobSASPermissions.parse('cw'), expiresOn },
        getCredential()
    ).toString();
    return `https://${account}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${sas}`;
}
function getPublicUrl(blobName) {
    return `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;
}
module.exports = { getUploadSasUrl, getPublicUrl };