const User = require('./../models/user');

const Authentication = require('./../controllers/authentication');
const passport = require('passport');
const passportService = require('./../services/passport');

const requireSignin = passport.authenticate('local', { session: false });
const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = (app) => {
    app.post('/setlastcorrect/:type/:correct', requireAuth, (req, res) => {
        const user = req.user;
        console.log('pp', req.params.type, req.params.correct);
        // console.log('user', req.user);
        user.lastCorrect[req.params.type] = req.params.correct;
        user.markModified('lastCorrect');
        user.save().then((u) => {
            // console.log('help', u);
            res.send("done");
        });
    });
};