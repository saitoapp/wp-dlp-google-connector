const config = require('../../config.js');
const log = require('../common/log.js');

module.exports = {
    "deleteComment": async function deleteComment(commentId) {
        const request = require('request');
        let options = {
            url: 'https://graph.facebook.com/' + commentId,
            headers: {
                'Authorization': config.page_access_token
            }
        };
        log.info(`Deleting comment: ${commentId}`);
        return await request.delete(options);
    },
};