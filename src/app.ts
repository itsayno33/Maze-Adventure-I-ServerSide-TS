import express      from "express";
import createError  from 'http-errors';
import path         from "path";

import usersRouter  from './routes/users';
import maiexRouter  from './routes/mai';

var cookieParser = require('cookie-parser');
var logger = require('morgan');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const rootRouter = express.Router();
rootRouter.get(
  "/",
  async (req: express.Request, res: express.Response): Promise<void> => {
    res.send("Welcome to the Mai world! :-)");
  }
);
app.use("/",      rootRouter);
app.use("/users", usersRouter);
app.use("/mai",   maiexRouter);

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT=process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("listening on port 3000");
});

export default app;
