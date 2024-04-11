require('./config/db')
const express = require('express')
// const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const blogSchema = require('./models/blogSchema')
const { upload } = require('./multer')
const userSchema = require('./models/userSchema')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
    secret: 'cat',
    saveUninitialized: false,
    resave: false
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' },
    async function (username, password, done) {
        const user = await userSchema.findOne({ email: username, password })
        if (!user) {
            return done(null, false)
        }
        return done(null, user)
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, { id: user._id })
})

passport.deserializeUser(async (user, cb) => {
    const userData = await userSchema.findById(user.id)
    return cb(null, userData)
})

app.set('view engine', 'ejs')
app.use(express.static('uploads'))

app.get('/', async (req, res) => {
    const blogs = await blogSchema.find()
    res.render('pages/home', { blogs })
})

app.get('/add', (req, res) => {
    if (req.user) {
        return res.render('pages/add')
    }
    res.redirect('/login')
})

app.post('/add', upload, async (req, res) => {
    let data = req.body
    if (req.file) {
        data = { ...data, image: req.file.filename, username: req.user.name }
    }

    const newData = await blogSchema(data)
    await newData.save()
    res.redirect('/')
})

app.get('/signup', async (req, res) => {
    if (req.user) {
        return res.redirect('/')
    }
    res.render('pages/signup')
})

app.post('/signup', async (req, res) => {
    const data = req.body
    const user = await userSchema(data)
    await user.save()
    res.redirect('/login')
})

app.get('/login', async (req, res) => {
    if (req.user) {
        return res.redirect('/')
    }
    res.render('pages/login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
}))

app.get('/logout', async (req, res) => {
    req.logout(() => {
        res.redirect('/')
    })
})

app.listen(8000, () => {
    console.log('listening on port', 8000)
})
