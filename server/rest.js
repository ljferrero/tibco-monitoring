var operations = require('./db/db.opts.js');
class Rest {
    constructor() {
    }
    init(app) {
        app.post('/api/v1/processstats/instances', function (req, res) {
            operations.saveProcessStats(req, res);
        })
        app.get('/api/v1/processstats/instances', function (req, res) {
            operations.getAllProcessStats(req, res);
        })
        app.post('/api/v1/activitystats/instances', function (req, res) {
            operations.saveActivityStats(req, res);
        })
        app.get('/api/v1/activitystats/instances', function (req, res) {
            operations.getAllActivityStats(req, res);
        })
        app.get('/api/v1/transitionstats/instances', function (req, res) {
            operations.getAllTransitionStats(req, res);
        })
        app.post('/api/v1/transitionstats/instances', function (req, res) {
            operations.saveTransitionStats(req, res);
        })

    }
}
module.exports = new Rest();