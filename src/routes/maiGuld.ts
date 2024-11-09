import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.send('respond with a maiGuld');
});

module.exports = router;
