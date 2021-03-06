require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const socketIO = require('socket.io'); 

const { mongoose } = require('./db/mongoose');

const app = express();
const server = http.createServer(app);//for socket
let io = socketIO(server);
const port = process.env.PORT; 

// setInterval(() => {
//     https.get('https://safe-badlands-67690.herokuapp.com');
//     https.get('https://text--game.herokuapp.com');
// }, 600000);

app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

require('./routes/authRoutes')(app);
require('./routes/wordRoutes')(app);
require('./routes/nounRoutes')(app);
require('./routes/flashcardsRoutes')(app);
require('./routes/langRoutes')(app);
require('./routes/userFlashcardsRoutes')(app);
require('./routes/sentenceRoutes')(app);
require('./routes/userRoutes')(app);
require('./routes/chatRoutes')(app, io);
require('./routes/webScraper')(app);

app.get("/", (req, res) => {
  const hour = new Date().getHours();
  const minutes = new Date().getMinutes();
  res.send({ hour, minutes });
});

server.listen(port, () => {
    console.log('server started', port);
});

// module.exports = { app };

//CHAT
// let users = new Users;

// io.on('connection', (socket) => {
//     console.log('connected!');
//     socket.on('join', (params, callback) => {
//         // console.log('p', params);
//         socket.join(params.room);
//         users.removeUserByName(params.username);//no duplicates
//         users.addUser(socket.id, params.username, params.room);
//         io.to(params.room).emit('updateUsersSmall', users.getUsersList(params.room));
//         callback();
//     });
//     socket.on('disconnect', () => {
//         console.log('disconnected, bye');
//         let user = users.removeUserBySocket(socket.id);
//         console.log(user);
//         if(user){
//             io.to(user.room).emit('updateUsersSmall', users.getUsersList(user.room));
//         }
//     });
//     socket.on('privateMessageSmall', (params, callback) => {
//         const room = `${params.to}${params.from}`;
//         console.log('private message', room);
//         socket.join(room);
//     });
//     socket.on('joinGerman', (params, callback) => { 
//         // if(!params.username){
//         //     const u = users.getUser(socket.id);
//         //     if(u){
//         //         params.username = u.name;
//         //     }
            
//         //     console.log('new name', params);
//         // }
//         //->>>>>Later on send over previous room in params
//         // console.log('joined german channel sieg heil');
//         socket.leave('French');
//         users.removeUserByName(params.username);
//         io.to('French').emit('updateUsersSmall', users.getUsersList('French'));

//         socket.join(params.room);
//         users.addUser(socket.id, params.username, params.room);
//         io.to(params.room).emit('updateUsersSmall', users.getUsersList(params.room));

//         callback();
//     });
//     socket.on('joinFrench', (params, callback) => {
//         socket.leave('German');
//         users.removeUserByName(params.username);
//         io.to('German').emit('updateUsersSmall', users.getUsersList('German'));
//         // console.log('serverL French', params);
        
//         socket.join(params.room);
//         users.addUser(socket.id, params.username, params.room);
//         io.to(params.room).emit('updateUsersSmall', users.getUsersList(params.room));
//         callback();
//     });
//     socket.on('createMessageSmall', (message) => {
//         // console.log('message received', message);
//         const user = users.getUser(socket.id);
//         if(user){
//             // console.log('???', user);
//             io.to(user.room).emit('newMessageSmall', message);
//         } else {
//             console.log('no user!');
//         }
//         //eventually add timestamp later on  
//     });
// });
