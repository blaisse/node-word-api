require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Word } = require('./models/word');

const { ObjectID } = require('mongodb');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
//   next();
// });
app.options("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
});


app.post("/words", (req, res) => {
    let word = new Word({
        word: req.body.word,
        meaning: req.body.meaning,
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
app.get("/word", (req, res) => {
    //possible use React state to reject repeated word
    Word.aggregate([{$sample: {size:1}}]).then((word) => {
        res.send(word[0]);
    }, (e) => {
        res.status(400).send(e);
    });
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

app.listen(port, () => {
    console.log('server started');
});

module.exports = {app};