import {newGame, newHres} from '../lib/_JSON_mai_guld'

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get('/', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.type('.txt');
  res.send('respond with a maiGuld');
});

router.post('/newGame', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ret = newGame(req.body);
  res.type('application/json');
  res.json(ret);
});
router.get('/newGame', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.type('.txt');
  res.send('respond with a maiNewGame');
});

router.post('/newHres', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ret = newHres(req.body);
  res.type('application/json');
  res.json(ret);
});

router.get('/newHres', function(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.type('.txt');
  res.send('respond with a maiNewHres');
});

module.exports = router;
