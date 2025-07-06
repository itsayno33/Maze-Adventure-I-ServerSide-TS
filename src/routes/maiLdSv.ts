import { info, load, save } from '../lib/_JSON_mai_ldsv'
import { test }             from '../lib/_JSON_mai_ldsv_test'
import createError          from 'http-errors';

import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get ('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiLoadSave');
});

/*
**  Send SaveInfo
*/
router.post('/_info', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//debug      for (const key in req.body) console.error(`req.${key}: ${req.body[key]}`);

  try {
    const rslt = await info(req.body);
    if (rslt.ecode !== 0) {
      console.error(`*** error: ${rslt.ecode}: ${rslt.emsg} ***`);
      next(createError(406));
    }
    res.status(200);
    res.send(JSON.stringify(rslt, null, "\t"));
  } catch (err) {
    console.log(`LdSv info POST error: ${err}`);
    next(createError(406));
  }
});
router.get ('/_info', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiLdSv info');
});


/*
**  Send LaodData
*/
router.post('/_load', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//debug      for (const key in req.body) console.error(`req.${key}: ${req.body[key]}`);

  try {
    const rslt = await load(req.body);
    if (rslt.ecode !== 0) {
      console.error(`*** error: ${rslt.ecode}: ${rslt.emsg} ***`);
      next(createError(406));
    }
    res.status(200);
    res.send(JSON.stringify(rslt, null, "\t"));
  } catch (err) {
    console.log(`LdSv load POST error: ${err}`);
    next(createError(406));
  }
});
router.get ('/_load', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiLdSv load');
});


/*
**  Send SaveData
*/
router.post('/_save', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//debug  for (const key in req.body) console.error(`req.${key}: ${req.body[key]}`);

  try {
    const rslt = await save(req.body);
    if (rslt.ecode !== 0) {
      console.error(`*** error: ${rslt.ecode}: ${rslt.emsg} ***`);
      next(createError(406));
    }
    res.status(200);
    res.send(JSON.stringify(rslt, null, "\t"));
  } catch (err) {
    console.log(`LdSv save POST error: ${err}`);
    next(createError(406));
  }
});
router.get ('/_save', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.send('respond with a maiLdSv save');
});



/*
** For Test Function
*/
router.post('/test', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
//debug    for (const key in req.body) console.error(`req.${key}: ${req.body[key]}`);

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
//debug    for (const key in req.body) console.error(`req.${key}: ${req.body[key]}`);

    res.render('pages/test',{pid: -1});
  } catch (err) {
    console.log(`newLoad POST error: ${err}`);
    next(createError(406));
  }
//  res.send('respond with a Load Test  of mai');
});

module.exports = router;
