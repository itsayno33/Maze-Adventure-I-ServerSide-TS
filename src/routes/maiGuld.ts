import { Interface } from 'readline';
import {newGuld, allHres} from '../lib/_JSON_mai_guld'
import createError  from 'http-errors';

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get ('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiGuld');
});

router.post('/newGuld', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = newGuld(req.body);
    res.status(200);res.send(ret);
  } catch (err) {
    console.log(`newGame POST error: ${err}`);
    next(createError(406));
  }
});
router.get ('/newGuld', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a New Game To Guld of mai');
});

router.post('/allHres', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = allHres(req.body);
    res.status(200);res.send(ret);
  } catch (err) {
    console.log(`newHres POST error: ${err}`);
    next(createError(406));
  }
});

router.get ('/allHres', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with Getting All Hres data of mai');
});

module.exports = router;
