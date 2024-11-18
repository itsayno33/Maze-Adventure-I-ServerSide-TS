import express from 'express';

var router = express.Router();
var maiGuldRouter = require('./maiGuld');
var maiMazeRouter = require('./maiMaze');
var maiLoadRouter = require('./maiLoad');

// router setup
router.use('/guld',   maiGuldRouter);
router.use('/maze',   maiMazeRouter);
router.use('/ldsv',   maiLoadRouter);

/* GET users listing. */
router.get('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.send('respond with a maiex');
});

module.exports = router;
