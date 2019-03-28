const config = require('../../config.js');
const log = require('../common/log.js');
const requestPromise = require('request-promise');

module.exports = {
    "deleteMessage": async function deleteMessage(messageId, userID) {
        //const request = require('request');
        let options = {
            url: 'https://graph.facebook.com/' + messageId + '?user=' + userID,
            headers: {
                'Authorization': config.page_access_token
            }
        };
        log.info(`Deleting message: ${messageId}`);
        return await requestPromise.delete(options);
    },
};