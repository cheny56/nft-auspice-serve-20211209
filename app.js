var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const ordersrouter=require('./routes/orders')
const favoritesrouter=require('./routes/favorites' )
const itemsrouter=require('./routes/items' )
const collectionsrouter=require('./routes/collections' )
const contentsrouter=require('./routes/contents' )
const bundlesrouter=require('./routes/bundles' )
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersrouter);
app.use('/favorites', favoritesrouter);
app.use('/items', itemsrouter);
app.use('/collections', collectionsrouter )
app.use('/contents', contentsrouter )
app.use('/bundles', bundlesrouter )

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

const cron=require('node-cron'),moment=require('moment');
  cron.schedule('*/1 * * * *',()=>{  console.log(moment().format('HH:mm:ss, YYYY-MM-DD'))
})
