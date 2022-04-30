// importing dependencies
import express from 'express'
import handlebars from 'express-handlebars';
import session from 'express-session';
import mongoose from 'mongoose';
import passport from 'passport';
import bcrypt from 'bcrypt';
import MongoStore from 'connect-mongo';
import m from 'moment'
import User from './models/Users.js'
import {} from 'dotenv/config'
import {
    Server
} from 'socket.io';
import {
    Strategy as LocalStrategy
} from 'passport-local';
import {
    dirname
} from 'path';
import path from 'path';
import {
    fileURLToPath
} from 'url';

const __dirname = dirname(fileURLToPath(
    import.meta.url));

// Initializing server 
const app = express();

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
const io = new Server(server);
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Setting Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');
// Setting css
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '/public')))

// Connecting MONGODB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw new Error("Couln't connecto to db 🚨")
    console.log('db connected 😎')
})

// Creating mongo session
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        ttl: 300
    }),
    secret: process.env.MONGODB_SECRET,
    resave: true,
    saveUninitialized: true,
}))

// Setting passport
app.use(passport.initialize());
app.use(passport.session());

// Serializing passport
passport.serializeUser((user, done) => {
    return done(null, user.id);
})

// Deserializing passport
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        return done(err, user);
    })
})

// Setting passport Strategy
// passport.use('signup', new LocalStrategy({
//     passReqToCallback: true
// }, (req, email, password, done) => {
//     User.findOne({
//         email: email
//     }, (err, user) => {
//         if (err) return done(err)
//         const newUser = {
//             username: req.body.username,
//             email: email,
//             password: createHash(password)
//         }
//         User.create(newUser, (err, userCreated => {
//             if (err) return done(err);
//             return done(null, userCreated)
//         }))
//     })
// }))

passport.use('signup', new LocalStrategy({
    passReqToCallback: true
}, (req, username, password, done) => {
    User.findOne({
        username: username
    }, (err, user) => {
        if (err) return done(err)
        if (user) return done(null, false, {
            message: "User already registered"
        })
        const newUser = {
            username: username,
            name: req.body.name,
            accountCreated: m().format('HH:mm:ssA DD/MM/YYY'),
            password: createHash(password),
            userColor: randomColor(),
            connection:true
        }
        User.create(newUser, (err, userCreated) => {
            if (err) return done(err);
            return done(null, userCreated)
        })
    })
}))

const createHash = (pw) => {
    return bcrypt.hashSync(pw, bcrypt.genSaltSync(10))
}

const randomColor = () => {
    const color = Math.floor(Math.random() * 16777215).toString(16);
    const randomColor = '#' + color;
    return randomColor;
}

// Connection Socket.io
// io.on('connection', () => {
//     console.log('New user connected 😋')
// })


// routes
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
})

app.get('/signup', (req, res) => {
    res.render('signup', {
        title: 'Sign up'
    })
})

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Log in'
    })
})

app.post('/signupForm', passport.authenticate('signup', {
    failureRedirect: '/signup'
}), (req, res) => {
    res.redirect('/login')
})