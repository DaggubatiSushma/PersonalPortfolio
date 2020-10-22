var path = require('path');
const express=require('express')
var routes = require('./routes/index');
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var data=require('./data/index.json')
var download=require('download-pdf')

const port=3000
app.listen(process.env.PORT || 5000)
console.log('listenig port')

var createError = require('http-errors');

var cookieParser = require('cookie-parser');

const session = require('express-session');
var MemoryStore = require('memorystore')(session)
const flash = require('express-flash');
var logger = require('morgan');

const bodyParser = require('body-parser');

app.use(logger('dev'));
app.use(express.json());

const middlewares = [
  express.static(path.join(__dirname, 'public')),
  bodyParser.urlencoded({ extended: true }),
  cookieParser(),
  session({
    secret: 'super-secret-key',
    key: '  super-secret-cookie',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000,
      store: new MemoryStore({
        checkPeriod: 86400000
      }), }
  }),
  flash(),

];
app.use(middlewares);

app.use('/', routes);
app.get('/download', function(req, res){
  var file=path.join(__dirname,'./data/SushmaDaggubati-Resume.pdf')
  res.download(file, function (err) {
    if (err) {
        console.log("Error");
        console.log(err);
    } else {
        console.log("Success");
    }
});
});

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
