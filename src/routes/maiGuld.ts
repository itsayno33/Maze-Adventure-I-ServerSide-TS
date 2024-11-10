import {newGame, newHres} from '../lib/_JSON_mai_guld'

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.send('respond with a maiGuld');
});

router.post('/newGame', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ret = newGame(req.body);
  res.json(ret);
});

router.post('/newHres', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ret = newHres(req.body);
  res.json(ret);
});

module.exports = router;
