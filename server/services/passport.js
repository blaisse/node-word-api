const passport = require('passport');
const User = require('./../models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const localOptions = { usernameField: 'email' };

const localLogin = new LocalStrategy(localOptions, function(email, password, done){
    User.findOne({ email }).then((user) => {
        if(!user){
            return done(null, false);
        }
        //compare password
        user.comparePasswords(password, function(err, isMatch){
            if(err) return done(err);
            if(!isMatch) return done(null, false);//not matching
            return done(null, user);//matching
            //return the user to Authentication.signin
        });
    }).catch((e) => {
        return done(e);
    });
});

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.SECRET
};

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
    User.findById(payload.sub).then((user) => {
        if(user){
            done(null, user);
        } else {
            done(null, false);
        }
    }).catch((e) => {
        return done(e, false);
    });
});

passport.use(localLogin);
passport.use(jwtLogin);