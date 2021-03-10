const router = require('express').Router();
const controller = require('./appnode.controller');
let multer = require('multer');
let upload  = multer({ storage: multer.memoryStorage() });
/**
 * GET     /nodes              ->  index
 * POST    /nodes              ->  create
 * GET     /nodes/:id          ->  show
 * PUT     /nodes/:id          ->  update
 * DELETE  /nodes/:id          ->  destroy
 */
router.get('/', controller.index);
router.get('/health', controller.getHealthStatus);
router.get('/platformDetails', controller.platformDetails);
router.put('/logBackUpload', controller.uploadlogBack);

router.post('/', controller.create);
router.get('/:id', controller.show);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.get('/:id/info', controller.getAppNodeRuntimeInfo);
router.get('/:id/state', controller.getAppNodeRuntimeState);
router.get('/:id/jobstats', controller.getJobStats);
router.get('/:id/applications', controller.getApplications);
router.get('/:id/statsenablements', controller.getStatsEnablements);
router.post('/:id/statsenablements', controller.enableApplicationStatsOnAppNode);
router.delete('/:id/statsenablements', controller.disableApplicationStatsOnAppNode);
router.get('/:id/logBack', controller.getLogBack);
//router.put('/:id/logBackUpload', controller.uploadlogBack);

router.param('id', controller.loadAppNodeById);



module.exports = router;