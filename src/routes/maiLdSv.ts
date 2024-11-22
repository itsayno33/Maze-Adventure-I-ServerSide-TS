import {test} from '../lib/_JSON_mai_ldsv_test'
import createError  from 'http-errors';

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get ('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiLoadSave');
});

/*
** For Test Function
*/
router.post('/test', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug
    for (const key in req.body) console.error(`req.${key}: ${req.body[key]}`);

    const rslt = await test(req.body);
    if (rslt.ecode !== 0) {
      console.error(`*** error: ${rslt.ecode}: ${rslt.emsg} ***`);
      next(createError(406));
    }

    res.render('pages/test', rslt);
  } catch (err) {
    console.error(`newLoad POST error: ${err}`);
    next(createError(406));
  }
});
router.get ('/test', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug
    for (const key in req.body) console.error(`req.${key}: ${req.body[key]}`);

    res.render('pages/test',{pid: -1});
  } catch (err) {
    console.log(`newLoad POST error: ${err}`);
    next(createError(406));
  }
//  res.send('respond with a Load Test  of mai');
});

module.exports = router;
