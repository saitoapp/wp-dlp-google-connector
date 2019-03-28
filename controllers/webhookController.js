const config = require('../config');
const log = require('../lib/common/log.js');
//const DLP = require('@google-cloud/dlp');
const dlp = require('../lib/models/dlp.js');
const post = require('../lib/models/post.js');
const comment = require('../lib/models/comment.js');
const workchat = require('../lib/models/workchat.js');
const me = require('../lib/models/me.js');

class webhookController {
    tokenVerification(req, res) {
        if (req.query["hub.verify_token"] === config.verify_token) {
            return res.status(200).send(req.query["hub.challenge"]);
        } else {
            log.error('Wrong token provided');
            return res.status(500).send('Wrong token');
        }
    }
    messageReceive(req, res) {
        // Object
        let msgObject = req.body.object;
        let msgEntries = req.body.entry;
        switch (msgObject) {
            case 'group':
                // Is there many entries?
                for (let i = 0; i < msgEntries.length; i++) {
                    let msgChanges = req.body.entry[i].changes;

                    // Is there many changes?
                    for (let z = 0; z < msgChanges.length; z++) {
                        // Field (posts, comments, ...)
                        let field = msgChanges[z].field;

                        // Each field has its own structure
                        let verb;
                        switch (field) {
                            case 'posts':
                                verb = msgChanges[z].value.verb;
                                switch (verb) {
                                    case 'add':
                                        // From
                                        let fromId = msgChanges[z].value.from.id;
                                        let fromName = msgChanges[z].value.from.name;

                                        // Post info
                                        let postId = msgChanges[z].value.post_id;
                                        let created_time = msgChanges[z].value.created_time;
                                        let message = msgChanges[z].value.message;
                                        let permalink_url = msgChanges[z].value.permalink_url;

                                        log.info(`Received a post activity (${verb}) made by "${fromName}" (${fromId}) identified by "${postId}" on "${created_time}", Message: "${message}". Permalink URL: ${permalink_url}`);

                                        // DLP inspection
                                        dlp.inspect(message).then(resultInspection => {
                                            if(resultInspection) {
                                                // Delete post
                                                if(post.deletePost(postId)) {
                                                    log.info(`Post deleted: ${postId}`);
                                                }

                                                // Notify user
                                                me.sendMessage(fromId, `We had to delete your message because it violates our policy. It contains ${resultInspection}.`).then(
                                                    log.info(`Message sent to: ${fromId} (${resultInspection})`)
                                                ).catch(err =>
                                                    log.error(`Message failed: ${err}`)
                                                )
                                            }
                                        });

                                        res.sendStatus(200);
                                        break;
                                    default:
                                        log.error(`At this moment the verb ${verb} on field ${field} is not handled by this script.`);
                                        res.sendStatus(200);
                                        break;
                                }
                                break;
                            case 'comments':
                                verb = msgChanges[z].value.verb;
                                switch (verb) {
                                    case 'add':
                                        // From
                                        let fromId = msgChanges[z].value.from.id;
                                        let fromName = msgChanges[z].value.from.name;

                                        // Comment info
                                        let commentId = msgChanges[z].value.comment_id;
                                        let targetPostId = msgChanges[z].value.target_post_id
                                        let created_time = msgChanges[z].value.created_time;
                                        let message = msgChanges[z].value.message;
                                        let permalink_url = msgChanges[z].value.permalink_url;

                                        log.info(`Received a comment activity (${verb}) made by "${fromName}" (${fromId}) identified by "${commentId}" on "${created_time}", Message: "${message}". Permalink URL: ${permalink_url}`);

                                        // DLP inspection
                                        dlp.inspect(message).then(resultInspection => {
                                            if(resultInspection) {
                                                // Delete comment
                                                if(comment.deleteComment(commentId)) {
                                                    log.info(`Comment deleted: ${commentId}`);
                                                }

                                                // Notify user
                                                me.sendMessage(fromId, `We had to delete your message because it violates our policy. It contains ${resultInspection}.`).then(
                                                    log.info(`Message sent to: ${fromId} (${resultInspection})`)
                                                ).catch(err =>
                                                    log.error(`Message failed: ${err}`)
                                                )
                                            }
                                        });

                                        res.sendStatus(200);
                                        break;
                                    default:
                                        log.error(`At this moment the verb ${verb} on field ${field} is not handled by this script.`);
                                        res.sendStatus(200);
                                        break;
                                }
                                break;
                            default:
                                log.error(`At this moment the field ${field} is not handled by this script.`);
                                res.sendStatus(200);
                                break;
                        }
                    }
                }
                break;
            case 'user':
                // Is there many entries?
                for (let i = 0; i < msgEntries.length; i++) {
                    let msgChanges = req.body.entry[i].changes;

                    // Is there many changes?
                    for (let z = 0; z < msgChanges.length; z++) {
                        // Field (posts, comments, ...)
                        let field = msgChanges[z].field;

                        // Each field has its own structure
                        let verb;
                        switch (field) {
                            case 'message_sends':
                                // From
                                let fromId = msgChanges[z].value.from.id;
                                let fromName = msgChanges[z].value.from.name;

                                // Message
                                let message = msgChanges[z].value.message;
                                let messageId = msgChanges[z].value.id;
                                let created_time = msgChanges[z].value.created_time;

                                log.info(`Received a user activity (message_sends) made by "${fromName}" (${fromId}) identified by "${messageId}" on "${created_time}", Message: "${message}"`);

                                // DLP inspection
                                dlp.inspect(message).then(resultInspection => {
                                    if(resultInspection) {
                                        // Delete message (sender)
                                        workchat.deleteMessage(messageId, fromId).then(resultDelete => {
                                            log.info(JSON.stringify(resultDelete));
                                            if(resultDelete) {
                                                log.info(`Message deleted: ${messageId} for ${fromId}`);
                                            }
                                        }).catch(err =>
                                            log.error(`Message delete failed: ${err}`)
                                        );

                                        // Delete message (recipients)
                                        for (let k = 0; k < msgChanges[z].value.to.data.length; k++) {
                                            workchat.deleteMessage(messageId, msgChanges[z].value.to.data[k].id).then(resultDelete => {
                                                log.info(JSON.stringify(resultDelete));
                                                if(resultDelete) {
                                                    log.info(`Message deleted: ${messageId} for ${fromId}`);
                                                }
                                            }).catch(err =>
                                                log.error(`Message delete failed: ${err}`)
                                            );
                                        }

                                        // Notify sender
                                        me.sendMessage(fromId, `We had to delete your chat message because it violates our policy. It contains ${resultInspection}.`).then(
                                            log.info(`Message sent to: ${fromId} (${resultInspection})`)
                                        ).catch(err =>
                                            log.error(`Message failed: ${err}`)
                                        )
                                    }
                                });
                                res.sendStatus(200);
                                break;
                            default:
                                log.error(`At this moment the field ${field} is not handled by this script.`);
                                res.sendStatus(200);
                                break;
                        }
                    }
                }
                break;
            default:
                log.error(`Object type ${msgObject} is not handled by this script. Make sure your Workplace integration has the right webhooks.`);
        }
    }
}

const webhook = new webhookController();
export default webhook;