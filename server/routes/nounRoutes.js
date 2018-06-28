const { Noun } = require('./../models/noun');

const User = require('./../models/user');

const Authentication = require('./../controllers/authentication');
const passport = require('passport');
const passportService = require('./../services/passport');

const requireSignin = passport.authenticate('local', { session: false });
const requireAuth = passport.authenticate('jwt', { session: false });


module.exports = (app) => {

    app.post('/noun', (req, res) => {
        let noun = new Noun({
            word: req.body.word,
            article: req.body.article,
            lang: req.body.lang,
            meaning: req.body.meaning,
            img: req.body.img,
            plural: req.body.plural
        });
        noun.save().then((n) => {
            res.send(n);
        }, (e) => {
            res.status(404).send(e);
        });
    });
    app.get('/noun/:name', (req, res) => {
        let name = req.params.name;
        Noun.findOne({ word: name }).then((word) => {
            if(word){
                res.send(word);
            } else {
                res.send(null);
            }
        });
    });
    app.get('/userfetchnoun/:lang/:user', (req, res) => {
        User.findOne({ email: req.params.user }).then((user) => {
            if(user){
                // console.log('?', user.lastCorrect['noun']);
          
                //fetch a noun that is not the one in lastCorrect.noun
                Noun.aggregate([
                    { $match: { lang: req.params.lang } },
                    { $match: { word: {$ne: user.lastCorrect['noun'] } } },
                    { $sample: { size: 1 }  } 
                ]).then((n) => {
                    res.send(n[0])
                });
            }
        }).catch((e) => {
            res.send(e);
        });
    });
    app.post('/fetch', (req, res) => {
        Noun.find({lang: req.body.lang}).then((nouns) => {
            const rand = Math.floor(Math.random() * nouns.length);
            res.send(nouns[rand]);
        
        }).catch((e) => {
            res.status(404).send(e);
        });
    });
    
    app.get('/plural/:lang/:user', (req, res) => {
        User.findOne({ email: req.params.user }).then((u) => {
            if(u){
                // console.log('help?');
                Noun.aggregate([
                    { $match: { lang: req.params.lang, plural: { "$exists": true } } },
                    { $match: { word: { $ne: u.lastCorrect['plural'] } } },
                    { $sample: { size: 1 } }
                ]).then((nouns) => {
                    console.log(u.lastCorrect['plural'], nouns[0]);                    
                  res.send(nouns[0]);
                });
            } else {
                // console.log('here');
                Noun.aggregate([
                    { $match: { lang: req.params.lang, plural: { "$exists": true } } },
                    { $sample: { size: 1 } }
                ]).then((nouns) => {
                    console.log(nouns[0]);
                  res.send(nouns[0]);
                });
            }
        });
    
    });

};