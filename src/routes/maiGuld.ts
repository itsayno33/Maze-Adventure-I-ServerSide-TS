import { Interface } from 'readline';
import {newGame, newHres} from '../lib/_JSON_mai_guld'
import createError  from 'http-errors';

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get ('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiGuld');
});

router.post('/newGame', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = newGame(req.body);
    res.status(200);res.json(ret);
  } catch (err) {
    console.log(`newGame POST error: ${err}`);
    next(createError(406));
  }
});
router.get ('/newGame', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiNewGame');
});

router.post('/newHres', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = newHres(req.body);
    res.status(200);res.json(ret);
  } catch (err) {
    console.log(`newHres POST error: ${err}`);
    next(createError(406));
  }
});

router.get ('/newHres', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiNewHres');
});

module.exports = router;
