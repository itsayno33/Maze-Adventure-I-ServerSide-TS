import { allMaze, getMaze, newMaze }  from '../lib/_JSON_mai_maze';
import createError  from 'http-errors';

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get ('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiMaze');
});

router.post('/newMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = newMaze(req.body);
    res.status(200);
    res.send(JSON.stringify(ret, null, "\t"));
  } catch (err) {
    console.log(`newGame POST error: ${err}`);
    next(createError(406));
  }
});

router.get ('/newMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a New Game To Maze of mai');
});

router.post('/getMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = getMaze(req.body);
    res.status(200);
    res.send(JSON.stringify(ret, null, "\t"));
  } catch (err) {
    console.log(`newMaze POST error: ${err}`);
    next(createError(406));
  }
});

router.get ('/getMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with Getting New Maze data of mai');
});


router.post('/allMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);

    const ret = allMaze(req.body);
    res.status(200);
    res.send(JSON.stringify(ret, null, "\t"));
  } catch (err) {
    console.log(`mazeInfo POST error: ${err}`);
    next(createError(406));
  }
});

router.get ('/allMaze', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with All Maze Infomation of mai');
});

module.exports = router;
