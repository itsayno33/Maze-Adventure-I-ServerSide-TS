import {newGuld, allHres} from '../lib/_JSON_mai_guld'
import createError  from 'http-errors';

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get ('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiLoad');
});

router.post('/test', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.log(`req.${key}: ${req.body[key]}`);
/*
    const ret = newTest(req.body);
    res.status(200);
    res.send(JSON.stringify(ret, null, "\t"));
*/
    res.render('pages/test',req.body);
  } catch (err) {
    console.log(`newLoad POST error: ${err}`);
    next(createError(406));
  }
});
router.get ('/test', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    res.render('pages/test',req.body);
  } catch (err) {
    console.log(`newLoad POST error: ${err}`);
    next(createError(406));
  }
//  res.send('respond with a Load Test  of mai');
});

module.exports = router;
