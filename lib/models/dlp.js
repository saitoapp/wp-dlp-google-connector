const log = require('../common/log.js');
const DLP = require('@google-cloud/dlp');

module.exports = {
    "inspect": async function inspect(message) {
        const dlp = new DLP.DlpServiceClient();
        const projectId = 'dlpsaito';
        const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

        // The maximum number of findings to report (0 = server maximum)
        const maxFindings = 0;

        // The infoTypes of information to match
        const infoTypes = [{name: 'CREDIT_CARD_NUMBER'}, {name: 'BRAZIL_CPF_NUMBER'}];

        // Whether to include the matching string
        const includeQuote = true;

        // Construct item to inspect
        const item = {value: message};

        // Construct request
        const request = {
            parent: dlp.projectPath(projectId),
            inspectConfig: {
                infoTypes: infoTypes,
                minLikelihood: minLikelihood,
                limits: {
                    maxFindingsPerRequest: maxFindings,
                },
                includeQuote: includeQuote,
            },
            item: item,
        };

        // Run request
        try {
            const response = await dlp.inspectContent(request);
            const findings = response[0].result.findings;
            if (findings.length > 0) {
                log.info(`Findings:`);
                let blockReason = '';
                findings.forEach(finding => {
                    if (includeQuote) {
                        //log.info(`\tQuote: ${finding.quote}`);
                    }
                    //log.info(`\tInfo type: ${finding.infoType.name}`);
                    //log.info(`\tLikelihood: ${finding.likelihood}`);
                    blockReason = finding.infoType.name;
                });
                return blockReason;
            } else {
                log.info(`DLP: Message is clean.`);
                return false;
            }
        } catch (err) {
            log.info(`DLP: Error in inspectString: ${err.message || err}`);
        }
    }
};