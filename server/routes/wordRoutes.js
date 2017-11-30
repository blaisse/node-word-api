const { Word } = require('./../models/word');
const User = require('./../models/user');


module.exports = (app) => {
    app.post("/words", (req, res) => {
        let word = new Word({
            word: req.body.word,
            meaning: req.body.meaning,
            lang: req.body.lang,
            conj: req.body.conj
            
        });
        word.save().then((doc) => {
            res.send(doc);
        }, (e) => {
            res.send(400).send(e);
        });
    });
    
    app.get("/words", (req, res) => {
        Word.find().then((words) => {
            res.send({words});
        }, (e) => {
            res.status(400).send(e);
        });
    });
    app.post("/word", (req, res) => {
        //possible use React state to reject repeated word
        const times = req.body.time; //array of strings
        const present_simple = 'simple';
        const past_simple = 'past_simple';
        var rDocs = [];
        var arr= [];
        const user = req.body.user;
        console.log('user', user);
        if(user){
            User.findOne({ email: user }).then((u) => {
                // console.log('hilfe', u);
                Word.find({lang: req.body.lang, word: { $ne: u.lastCorrect['verb'] }}).then((docs) => {
                    console.log('www', docs);
                    docs.forEach(function(item){
                        var x = req.body.time;
                        // console.log(x);
                        var y = [];
                        item.conj.forEach(function(obj) {
                            x.forEach(function(tense){
                              if(obj.time === tense) y.push(tense);
                            });
                        });
                        if(y.length === x.length){
                            rDocs.push(item);
                        }
                    });
                    console.log('rDocs', rDocs);
                    const random = Math.floor(Math.random() * rDocs.length);
                    res.send(rDocs[random]);
                });
            });
        } else {
            Word.find({lang: req.body.lang}).then((docs) => {
                docs.forEach(function(item){
                    var x = req.body.time;
                    var y = [];
                    item.conj.forEach(function(obj) {
                        x.forEach(function(tense){
                          if(obj.time === tense) y.push(tense);
                        });
                    });
                    if(y.length === x.length){
                        rDocs.push(item);
                    }
                });
                // console.log('rDocs', rDocs);
                const random = Math.floor(Math.random() * rDocs.length);
                res.send(rDocs[random]);
            });
        }
        
        // Word.aggregate([
        //     { $match: { conj: { $elemMatch: { time: "simple" } } } },
        //     { $match: { conj: { $elemMatch: { time: "past_simple" } } } },
        //     { $sample: { size: 1 } }
        // ]).then((verb) => {
        //     if(verb) res.send(verb[0]);
        // }, (e) => {
        //     res.status(404).send(e);
        // });
        // Word.aggregate([
        //     {$sample: {size:1}}
        // ]).then((word) => {
        //     res.send(word[0]);
        // }, (e) => {
        //     res.status(400).send(e);
        // });
    });
    app.get("/word/:name", (req, res) => {
        var name = req.params.name;
        Word.findOne({word: name}).then((w) => {
            if(w){
                res.send(w);
            } else {
                res.send(null);
            }
        });
    });
    app.patch('/word/:name', (req, res) => {
        var name = req.params.name;
        var body = req.body;
        Word.findOneAndUpdate({ _id: body._id, word: name },{$set: body},{new: true}).then((w) => {
            if(!w) {
                return res.status(404).send({ omg: "omg" });
            }
            res.send({ w });
        }).catch((e) => {
            res.status(404).send({ error: "ERROR"});
        });
    });
};