import dotenv from 'dotenv';
import express from 'express';
import expressLayout from 'express-ejs-layouts';
import homerouter from './server/routes/main.js';
import adminrouter from './server/routes/admin.js'
import connectDB from './server/config/db.js';
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import methodOverride from 'method-override';
dotenv.config();



const app = express();
const PORT = 5000 || process.env.PORT ;

connectDB();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(expressLayout);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
    }),
}));
app.use(methodOverride('_method'));

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', homerouter);
app.use('/', adminrouter);




app.listen(PORT,() => {
    console.log(`App is listening on port ${PORT}`)
});