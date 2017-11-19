const { Noun } = require('./../models/noun');

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
    app.post('/fetch', (req, res) => {
        Noun.find({lang: req.body.lang}).then((nouns) => {
            const rand = Math.floor(Math.random() * nouns.length);
            res.send(nouns[rand]);
        
        }).catch((e) => {
            res.status(404).send(e);
        });
    });
    
    app.get('/plural/:lang', (req, res) => {
      Noun.aggregate([
          { $match: { lang: req.params.lang, plural: { "$exists": true } } },
          { $sample: { size: 1 } }
      ]).then((nouns) => {
        res.send(nouns[0]);
      });
    });

};