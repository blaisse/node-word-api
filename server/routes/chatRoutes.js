const { Users } = require('./../users');
// const socketIO = require('socket.io'); 
// const http = require('http');

module.exports = (app, io) => {
  
    // const server = http.createServer(app);//for socket..
    // let io = socketIO(server);
    let chatUsers = new Users();
    let savedMessages = {};

    io.on('connection', (socket) => {
        // console.log('connected');
        socket.on('join', (user) => {
            // console.log('help', user);

            //dont emit if user is already there?
            const u = chatUsers.getUserByName(user.user);
            // console.log('u', u);
            if(u){
                // socket.join(user.channel);
                // io.to(user.channel).emit('updateList', chatUsers.getUsersList(user.channel, user.user));
                return;
            }
            // console.log('after return');
            socket.join(user.channel);
            chatUsers.removeUserByName(user.user);
            chatUsers.addUser(socket.id, user.user, user.channel);

          
            // console.log('chat:', chatUsers);
            //user joined, update list
            io.to(user.channel).emit('updateList', chatUsers.getUsersList(user.channel, user.user));
        });
        socket.on('createMessage', (message) => {
            console.log('creating general message', message);
            const user = chatUsers.getUserByName(message.writing);
            if(user){
                console.log('omg', user);
                io.to(user.room).emit('sendMessage', message);
            }
        });
        socket.on('joinPrivate', (user) => {
            //user => channel, id
            // console.log('server - p', user);
            // socket.leave(user.channel);
            socket.join(user.channel);
            const u = chatUsers.getUserByName(user.person);
            // console.log('user rooms', u.id.rooms);
            // console.log('???', u.id, u.name);
            
            // console.log('uuu', u);
            // console.log(';oppp', user);
            //send to the other user with MY username -> person
            io.to(u.id).emit('privateChatOpenNotify', { channel: user.channel, person: user.me });
        });
        socket.on('saveMessage', (data) => {
            const u = chatUsers.getUserByName(data.me);
            if(savedMessages[data.me]){
                // savedMessages[data.me].push(data.message);

            } else {
                savedMessages[data.me] = [];
                savedMessages[data.me].push(data.message);
            }
            
            // console.log('d', savedMessages);
            // io.to(u.id).emit('savingMessage', data);
        });
        socket.on('joinPrivateChat', (data) => {
            socket.join(data.channel, () => {
                // console.log('HELP',socket.rooms);            
            });
            const u = chatUsers.getUserByName(data.person);
            // io.to(u.id).emit('acceptPrivateChat', { channel: data.channel, person: data.me });
        });
        socket.on('createPrivateMessage', (data) => {
            const u = chatUsers.getUserByName(data.person);
            if(u){
                if(io.sockets.connected[u.id]){
                    if(io.sockets.connected[u.id].rooms[data.channel]){
                        // console.log('user is in such a channel!');
                    } else {
                        //if user is not connected to the private chat
                        //connect him.. - browser refresh etc
                        // console.log('not in a channel! CONNECT HIM OMG');
                        io.sockets.connected[u.id].join(data.channel);
                    }
                }
            }

            
            // console.log('rooms:',socket.rooms);
            // console.log('data', data);
            // console.log('person rooms', person.id.rooms);
            io.to(data.channel).emit('sendPrivateMessage', data);
        });
        socket.on('leavePrivate', (channel) => {
            // socket.leave(channel.channel);
            // console.log('leaving channel', channel.channel);
        });
        socket.on('disconnect', () => {
            // console.log('server disconnected');
            // console.log('user disconnected- rooms', socket.rooms);
            const user = chatUsers.getUser(socket.id);            
            chatUsers.removeUserBySocket(socket.id);
            // console.log('user', user);
            //WTF?//user.room
            
            io.to('general').emit('updateList', chatUsers.getUsersList('general'));
        });
    });
};