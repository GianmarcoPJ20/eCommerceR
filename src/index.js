const express = require('express')
const morgan = require('morgan')
const {engine} = require('express-handlebars');
const path = require('path');

//incializaciones
const app = express();

//Settings
app.set('port',process.env.PORT || 4000);
app.set('views',path.join(__dirname, 'views'));
app.engine('.hbs', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}));
app.set('view engine','.hbs');

//middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));

//Global variables

//Routes
app.use(require('./routes/'));

//Public

//Starting the server
app.listen(app.get('port'), () => {
  console.log('server on port', app.get('port'));
});