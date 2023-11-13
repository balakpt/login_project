const express = require('express');
const app = express();
const hbs = require('hbs');
const path = require('path');
const mysql = require('mysql');
const doenv= require('dotenv');
const cookieParser = require('cookie-parser');

doenv.config({
    path:"./env",
});

const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASS,
    database:process.env.DATABASE_DB
});

db.connect((err)=>{
    if(err) throw err;
    console.log('db connection sucess')

});

app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

const location=path.join(__dirname,'public');

app.set('views', path.join(__dirname));
app.set('view engine', 'hbs');
app.use(express.static(location));

const partialsPath = path.join(__dirname,'views/partials');
hbs.registerPartials(partialsPath);

app.use('/', require('./routes/page'));
app.use('/auth', require('./routes/auth'));





app.listen(3000, (err) =>{
      if(err) throw err;
      console.log('port connection is sucessfull');
});