const router = require('express').Router();
const controller = require('./application.controller');

/**
 * GET     /nodes              ->  index
 * POST    /nodes              ->  create
 * GET     /nodes/:id          ->  show
 * PUT     /nodes/:id          ->  update
 * DELETE  /nodes/:id          ->  destroy
 */

router.get('/', controller.index);
router.get('/getConfigData', controller.getConfigData)
router.get('/checkToken',controller.checkToken);
router.get('/getName', controller.getName);
router.put('/changeStats', controller.changeStats);
router.get('/:id/processinstancecount', controller.processCount);
router.get('/:id/processinstancecountByStatus', controller.processCountByStatus);
router.put('/getStats', controller.getStats);
router.get('/:id', controller.show);
router.get('/:id/statsenablements', controller.getApplicationStatsEnablements);
router.post('/:id/statsenablements', controller.enableApplicationStatsOnAppNode);
router.delete('/:id/statsenablements', controller.disableApplicationStatsOnAppNode);

router.get('/:id/processstat', controller.getProcessStat);
router.get('/:id/activitystat', controller.getActivityStat);
router.get('/:id/config', controller.getConfig);
router.get('/:id/processdiagram', controller.getProcessDiagram);

router.get('/:id/processinstancestats', controller.getProcessInstanceStats);

router.get('/:id/allprocessinstancestats', controller.getAllProcessInstanceStats);
router.get('/:id/activityinstancestats', controller.getActivityInstanceStats);

router.get('/:id/subprocessinstances', controller.getSubprocessInstances);

router.param('id', controller.loadAppNodeById);

module.exports = router;