const { Word } = require('./../models/word');
const User = require('./../models/user');

module.exports = (app) => {
    app.post("/words", (req, res) => {
        let word = new Word({
            word: req.body.word,
            meaning: req.body.meaning,
            lang: req.body.lang,
            tenses: req.body.tenses
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
    app.post("/word", async (req, res) => {
        const tense = req.body.time; //string
        const user = req.body.user;
        console.log('tense', tense);
        if(user){
            //fetch a verb that is different from the last correctly answered
            const fetchedUser = await User.findOne({ email: user });
            const words = await Word.find({ 
                lang: req.body.lang,
                word: { $ne: fetchedUser.lastCorrect['verb'] },
                tenses: { $elemMatch: { tense: tense } }
                // "tenses.tense": tense
            }, { word: 1, meaning: 1, tenses: { $elemMatch: { tense: tense } } }); 
            const random = Math.floor(Math.random() * words.length);
            console.log('help', words[random]);
            res.send(words[random]);
        } else {
            const words = await Word.find({ 
                lang: req.body.lang,
                tenses: { $elemMatch: { tense: tense } }
            }, { word: 1, meaning: 1, tenses: { $elemMatch: { tense: tense } } });
            const random = Math.floor(Math.random() * words.length);
            res.send(words[random]);
            // Word.find({lang: req.body.lang}).then((docs) => {
            //     docs.forEach(function(item){
            //         var x = req.body.time;
            //         var y = [];
            //         item.conj.forEach(function(obj) {
            //             x.forEach(function(tense){
            //               if(obj.time === tense) y.push(tense);
            //             });
            //         });
            //         if(y.length === x.length){
            //             rDocs.push(item);
            //         }
            //     });
            //     const random = Math.floor(Math.random() * rDocs.length);
            //     res.send(rDocs[random]);
            // });
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