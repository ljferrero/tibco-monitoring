const routes = require('express').Router();

routes.use('/monitor', require('./appnodes'));
routes.use('/appnodes', require('./appnodes'));
routes.use('/register', require('./appnodes'));
routes.use('/applications', require('./applications'));

module.exports = routes;