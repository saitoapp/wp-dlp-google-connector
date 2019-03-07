const config = require('../../config.js');
const log = require('../common/log.js');

module.exports = {
    "getAvailablePostFields": function getAvailablePostFields(){
        return [
            "id",
            "created_time",
            "formatting",
            "from",
            "icon",
            "link",
            "message",
            "name",
            "object_id",
            "permalink_url",
            "picture",
            "place",
            "poll",
            "properties",
            "status_type",
            "story",
            "to",
            "type",
            "updated_time",
            "with_tags",
        ];
    },
    "deletePost": async function deletePost(postId) {
        const request = require('request');
        let options = {
            url: 'https://graph.facebook.com/' + postId,
            headers: {
                'Authorization': config.page_access_token
            }
        };
        log.info(`Deleting post: ${postId}`);
        return await request.delete(options);
    },
};