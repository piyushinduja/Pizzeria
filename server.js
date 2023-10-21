require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const exp = require('constants')
const passport = require('passport')
const Emitter = require('events')
const PORT = process.env.PORT || 3000

const app = express()

// Database Connection
mongoose.connect(process.env.MONGODB_URL);
const connection = mongoose.connection;
connection.once('open', ()=>{
    console.log("Database connected.....");
})

// Event Emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)


// Session Config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({mongoUrl: process.env.MONGODB_URL, collection:'sessions'}),
    saveUninitialized: false,
    cookie: {maxAge: 1000*60*60*24}
}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

// Session store
// let mongoStore = MongoDbStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })

app.use(flash())

//Assets
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Global middlewares
app.use((req, res, next)=>{
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// Set template engine
app.use(expressLayout)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/resources/views'))

require('./routes/web')(app)
app.use((req, res)=>{
    res.status(404).send("<h1>404, Page not found</h1>")
})

const server = app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
})


// Socket
const io = require('socket.io')(server)
io.on('connection', (socket)=>{
    // Join
    socket.on('join', (roomName)=>{
        socket.join(roomName)
    })
})


eventEmitter.on('orderUpdated', (data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data)=>{
    io.to('adminRoom').emit('orderPlaced', data)
})