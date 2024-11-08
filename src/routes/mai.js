var express = require('express');
var maiGuldRouter = require('./maiGuld');

var router = express.Router();

// view engine setup
router.use('/guld',   maiGuldRouter);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a maiex');
});

module.exports = router;
