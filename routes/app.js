var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
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
// const adminRouter = require("./routes/admin");

var usersrouter = require("./routes/users");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use("/", indexRouter);

app.use("/bundles", bundlesrouter);
app.use("/collections", collectionsrouter);
app.use("/contents", contentsrouter);
app.use("/favorites", favoritesrouter);
app.use("/items", itemsrouter);
app.use("/merchandises", itemsrouter);
app.use("/mint", mintrouter);
app.use("/my", myrouter);
app.use("/orders", ordersrouter);
app.use("/queries", queriesrouter);
app.use("/sales", salesrouter);
app.use("/stats", statsrouter);
app.use("/transactions", transactionsrouter);
app.use("/users", usersrouter);
app.use("/admin", adminRouter);

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
