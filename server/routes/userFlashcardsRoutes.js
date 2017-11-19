const User = require('./../models/user');
const Flashcard = require('./../models/flashcard');


const Authentication = require('./../controllers/authentication');
const passport = require('passport');
const passportService = require('./../services/passport');

const requireSignin = passport.authenticate('local', { session: false });
const requireAuth = passport.authenticate('jwt', { session: false });

module.exports = (app) => {
    app.post('/savecard', (req, res) => {
        // console.log(req.body.data, req.body.owner);
        User.findOne({ email: req.body.owner }).then((user) => {
            if(user){
                let obj = new Flashcard({
                    cards: req.body.data,
                    owner: user,
                    title: req.body.title
                });
                obj.save().then(() => {
                    
                });
                user.flashcards.push(obj);
                user.save();
                res.send({ user });
                // console.log('mmm', obj);
            } else {
                res.status(404).send({ error: 'no user found' });
            }
        });
    });
    
    app.get('/getcard/:user', requireAuth, (req, res) => {
        User.findOne({ email: req.params.user }).populate('flashcards').then((user) => {
            res.send(user.flashcards);
        });
    });
    app.get('/getsinglecard/:id', (req, res) => {
        Flashcard.findOne({ _id: req.params.id }).populate('owner').then((card) => {
            if(!card){
                return res.status(404).send();
            }
            res.send(card);
        }).catch((e) => {
            res.status(404).send(e);
        });
    });
};