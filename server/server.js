require('./config/config');

const Authentication = require('./controllers/authentication');
const passport = require('passport');
const passportService = require('./services/passport');

const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const axios = require('axios');
const http = require('http');
const socketIO = require('socket.io');

const { Users } = require('./users');

const { mongoose } = require('./db/mongoose');
const { Word } = require('./models/word');
const { Noun } = require('./models/noun');

const { ObjectID } = require('mongodb');

const app = express();
const server = http.createServer(app);//for socket..
let io = socketIO(server);
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

//CHAT
let users = new Users;

io.on('connection', (socket) => {
    console.log('connected!');
    socket.on('join', (params, callback) => {
        // console.log('p', params);
        socket.join(params.room);
        users.removeUserByName(params.username);//no duplicates
        users.addUser(socket.id, params.username, params.room);
        io.to(params.room).emit('updateUsers', users.getUsersList(params.room));
        callback();
    });
    socket.on('disconnect', () => {
        console.log('disconnected, bye');
        let user = users.removeUserBySocket(socket.id);
        console.log(user);
        if(user){
            io.to(user.room).emit('updateUsers', users.getUsersList(user.room));
        }
    });
    socket.on('joinGerman', (params, callback) => { 
        // if(!params.username){
        //     const u = users.getUser(socket.id);
        //     if(u){
        //         params.username = u.name;
        //     }
            
        //     console.log('new name', params);
        // }
        //->>>>>Later on send over previous room in params
        // console.log('joined german channel sieg heil');
        socket.leave('French');
        users.removeUserByName(params.username);
        io.to('French').emit('updateUsers', users.getUsersList('French'));

        socket.join(params.room);
        users.addUser(socket.id, params.username, params.room);
        io.to(params.room).emit('updateUsers', users.getUsersList(params.room));

        callback();
    });
    socket.on('joinFrench', (params, callback) => {
        socket.leave('German');
        users.removeUserByName(params.username);
        io.to('German').emit('updateUsers', users.getUsersList('German'));
        // console.log('serverL French', params);
        
        socket.join(params.room);
        users.addUser(socket.id, params.username, params.room);
        io.to(params.room).emit('updateUsers', users.getUsersList(params.room));
        callback();
    });
    socket.on('createMessage', (message) => {
        // console.log('message received', message);
        const user = users.getUser(socket.id);
        if(user){
            // console.log('???', user);
            io.to(user.room).emit('newMessage', message);
        } else {
            console.log('no user!');
        }
        //eventually add timestamp later on  
    });
});

//END OF CHAT

//AUTH
const requireSignin = passport.authenticate('local', { session: false });
const requireAuth = passport.authenticate('jwt', { session: false });

app.get('/', requireAuth, (req, res) => {
    // console.log(process.env.SECRET);
    res.send({ message: "Secret page!" });
});
app.post('/signin', requireSignin, Authentication.signin);
app.post('/signup', Authentication.signup);
//END OF AUTH

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

    Word.find({lang: req.body.lang}).then((docs) => {
        // console.log("DOCS", docs);
        docs.forEach(function(item){
            var x = req.body.time;
            // console.log(req.body.time);
            //  var x = ['futur', 'simple', 'past_simple'];
            // var x = ['futur'];
            // console.log(present_simple);
            var y = [];
            item.conj.forEach(function(obj) {
                x.forEach(function(tense){
                  if(obj.time === tense) y.push(tense);
                });
            });
            // console.log('???', rDocs);
            if(y.length === x.length){
                rDocs.push(item);
            }
        });
        // console.log('rDocs', rDocs);
        const random = Math.floor(Math.random() * rDocs.length);
        // console.log(random);
        res.send(rDocs[random]);
    });
    
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

//NOUN -----------------------
app.post('/noun', (req, res) => {
    let noun = new Noun({
        word: req.body.word,
        article: req.body.article,
        lang: req.body.lang,
        meaning: req.body.meaning,
        img: req.body.img
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
app.post('/fetchflashcard', (req, res) => {

    Noun.aggregate([
        { $match: { lang: req.body.lang } },
        { $sample: { size: 10 } }
    ]).then((flashcards) => {
        
        const x = flashcards.filter((item) => {
            return item.img;
        });
        
        res.send(x);
    });
    // Word.aggregate([
    //     {$sample: {size:1}}
    // ])
    // Noun.find({ lang: req.body.lang, img: { $exists: true } }).then((flashcards) => {
    //     res.send(flashcards);
    // }).catch((e) => {
    //     res.status(404).send(e);
    // });

    // Noun.find({ lang: req.body.lang, img: { $exists: true } }).then((flashcards) => {
    //     let num = 3;
    //     if(flashcards.length < num) num=flashcards.length;//flashcards.length
    //     let ar = [];
    //     for(let i=0;i<num;i++){
    //         let ran = Math.floor(Math.random() * num);
    //         ar.push(ran);
    //     }
    //     ar.forEach((item) => {

    //     });
    //    const r = [];
    //    ar.forEach((item) => {
    //      r.push(flashcards[item]);
    //    });
    //     console.log(r);
    //     res.send(r);
    // }).catch((e) => {
    //     res.status(404).send(e);
    // });
});

server.listen(port, () => {
    console.log('server started');
});

module.exports = {app};