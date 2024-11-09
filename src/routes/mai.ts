import express from 'express';

var router = express.Router();
var maiGuldRouter = require('./maiGuld');

// view engine setup
router.use('/guld',   maiGuldRouter);

/* GET users listing. */
router.get('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.send('respond with a maiex');
});

module.exports = router;
