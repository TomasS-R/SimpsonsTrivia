
function formatUserTag(username) {
    return '@' + username
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_{2,}/g, '_');
}

module.exports = { 
    formatUserTag
};
