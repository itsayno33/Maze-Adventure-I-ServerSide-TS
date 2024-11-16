import { mazeInfo, newGame, newMaze }  from '../lib/_JSON_mai_maze';
import createError  from 'http-errors';

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get ('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiMaze');
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

router.post('/newMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = newMaze(req.body);
    res.status(200);res.json(ret);
  } catch (err) {
    console.log(`newMaze POST error: ${err}`);
    next(createError(406));
  }
});

router.get ('/newMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiNewHres');
});


router.post('/mazeInfo', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = mazeInfo(req.body);
    res.status(200);res.json(ret);
  } catch (err) {
    console.log(`mazeInfo POST error: ${err}`);
    next(createError(406));
  }
});

router.get ('/mazeInfo', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiNewGame');
});

module.exports = router;
