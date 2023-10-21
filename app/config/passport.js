const localPassport = require('passport-local').Strategy
const User = require('../models/User')
const bycrypt = require('bcrypt')
const { use } = require('passport/lib')

function init(passport) {
    passport.use(new localPassport({ usernameField: 'email'}, async(email, password, done)=>{
        const user = await User.findOne({email: email})

        if(!user){
            return done(null, false, {message:"No user found with that email"})
        }

        bycrypt.compare(password, user.password).then(match=>{
            if(match){
                return done(null, user, {message:"Logged in successfully"})
            }
            return done(null, false, {message:"Incorrect username or password"})
        }).catch(err=>{
            return done(null, false, {message:"Something went wrong"})
        })

    }))

    passport.serializeUser((user, done)=>{
        done(null, user._id)
    })

    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user)=>{
            done(err, user)
        })
    })

}

module.exports = init