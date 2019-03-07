const config = require('../../config.js');
const requestPromise = require('request-promise');
const log = require('../common/log.js');

module.exports = {
    "sendMessage": async function sendMessage(recipientId, message) {
        let options = {
            url: 'https://graph.facebook.com/me/messages',
            headers: {
                "Authorization": config.page_access_token,
                "Content-Type": "application/json"
            },
            method: "POST",
            json: {
                "recipient": {
                    "id": recipientId
                },
                "message": {
                    "text": message
                }
            }
        };

        log.info(`Sending message to: ${recipientId}`);

        return await requestPromise(options);
    },
};