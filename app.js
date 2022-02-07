var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const {findone
	, updaterow
}=require('./utils/db')
const { gettimestr }=require('./utils/common')
var indexRouter = require("./routes/index");
const asksrouter = require("./routes/asks");
const bundlesrouter = require("./routes/bundles");
const collectionsrouter = require("./routes/collections");
const contentsrouter = require("./routes/contents");
const favoritesrouter = require("./routes/favorites");
const itemsrouter = require("./routes/items");
const merchandisesrouter = require("./routes/merchandises");
const mintrouter = require("./routes/mint");
const myrouter = require("./routes/my");
const ordersrouter = require("./routes/orders");
const queriesrouter = require("./routes/queries");
const salesrouter = require("./routes/sales");
const statsrouter = require("./routes/stats");
const transactionsrouter = require("./routes/transactions");
var usersrouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const bookmarksrouter = require("./routes/bookmarks");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const LOGGER=console.log
const {getipaddress}=require('./utils/session')
// view engine setup
const wrap = asyncFn => {
  return (async (req, res, next) => {
    try {      return await asyncFn(req, res, next) }
    catch (error) {      return next(error) }
  })
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json({limit:1024*1024*10, type:'application/json'});
var urlencodedParser = bodyParser.urlencoded({ extended:true,limit:1024*1024*10,type:'application/x-www-form-urlencoded' });
app.use(jsonParser)
app.use(urlencodedParser)

app.use(wrap(async(req,res,next)=>{let token=req.headers.token
  if (token){     const resp=await findone('sessionkeys',{token:token,active:1})
    // LOGGER('bXcKR6bgGp',resp)
    if(resp){req.username=resp.username // ;req.userlevel=resp.level
//      req.userdata = resp
      req.level = resp.level
      updaterow('sessionkeys',{id:resp.id },{lastactive:gettimestr()}) // token:token,active:1
    }
    else {  // req.userlevel=null
    }
  }
  LOGGER('3fX8T5ZBmQ',req.username,getipaddress(req) , req.connection.remotePort)
  next()
}))

app.use("/", indexRouter);

app.use("/bundles", bundlesrouter);
app.use("/collections", collectionsrouter);
app.use("/contents", contentsrouter);
app.use("/favorites", favoritesrouter);
app.use("/items", itemsrouter);
app.use("/merchandises", merchandisesrouter);
app.use("/mint", mintrouter);
app.use("/my", myrouter);
app.use("/orders", ordersrouter);
app.use("/queries", queriesrouter);
app.use("/sales", salesrouter);
app.use("/stats", statsrouter);
app.use("/transactions", transactionsrouter);
app.use("/users", usersrouter);
app.use("/admin", adminRouter);
app.use("/bookmarks", bookmarksrouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

const cron = require("node-cron"),
  moment = require("moment");
cron.schedule("*/1 * * * *", () => {
  console.log(moment().format("HH:mm:ss, YYYY-MM-DD"), "@itemverse");
});
