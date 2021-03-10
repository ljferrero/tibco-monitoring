

const logger = require('./logger/logger');
function statsImplementation(statsProvider) {
    if (statsProvider === 'REST') {
        return require('./rest.js');
    } else if (statsProvider === 'FTL') {
        return require('./ftl.js');
    } else {
        logger.error('Stats Provider not found ');
        // process.exit();
    }
}
module.exports = statsImplementation;
