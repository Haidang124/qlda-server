var createError = require("http-errors");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const config = require("./config");
// var logger = require('morgan');
const mongoose = require("mongoose");
var dotenv = require("dotenv");
// var session = require("express-session");
dotenv.config();
const port = process.env.PORT || 3002;

// kết nối databse
// local
require("./src/loaders/database")();
// cloud
// const URL = process.env.DB_URL;
// mongoose
//   .connect(
//     "mongodb+srv://admin:admin@cluster0.pjldk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then(() => {
//     console.log("connected mongodb");
//     console.log("Server is running at -> http://localhost:" + port);
//   })
//   .catch((err) => {
//     console.log(URL);
//     console.log(err);
//   });
// tạo các thư mục cần thiết
// require('./loaders/mkdirs')();

var app = express();
// app.enable("trust proxy");
// app.use(
//   session({
//     secret: "yoursecret",
//     domain: ".netlify.app",
//     proxy: true,
//     cookie: {
//       path: "/",
//       domain: ".netlify.app",
//       maxAge: 1000 * 60 * 24, // 24 hours
//     },
//   })
// );
// app.use(logger('dev'));

// cài đặt cors
var cors = require("cors");
app.use(
  cors({
    origin: [
      "https://qlda-project.netlify.app",
      "http://localhost:3001",
      "http://localhost:5000",
    ],
    methods: "GET,POST,OPTIONS,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,x-access-token,x-requested-with",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
// app.set("trust proxy", 1);
// app.use(
//   session({
//     secret: "Super Secret",
//     resave: true,
//     saveUninitialized: false,
//     cookie: {
//       sameSite: "none",
//       secure: true,
//     },
//   })
// );
app.use(bodyParser.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// cài đặt router
require("./src/routers")(app);
var server = require("http").Server(app);
var io = require("./src/loaders/socket")(server);
app.set("io", io);
app.set("port", port);
// console.log("Server is running at -> http://localhost:" + port);
server.listen(port);

// app.listen(port, () => {
//   console.log(`App listening at http://localhost:${port}`);
// });
module.exports = app;

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// handle error
// require('./loaders/handleError')(app);

// var app = express();

// // view engine setup

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
