const { Users } = require('./../users');

module.exports = (app, io) => {
  
    // const server = http.createServer(app);//for socket..
    // let io = socketIO(server);
    let chatUsers = new Users();
    let savedMessages = {};

    io.on('connection', (socket) => {
        socket.on('join', (user) => {

            //dont emit if user is already there?
            const u = chatUsers.getUserByName(user.user);
            if(u){
                // socket.join(user.channel);
                // io.to(user.channel).emit('updateList', chatUsers.getUsersList(user.channel, user.user));
                return;
            }
            socket.join(user.channel);
            chatUsers.removeUserByName(user.user);
            chatUsers.addUser(socket.id, user.user, user.channel);
          
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
            const user = chatUsers.getUser(socket.id);            
            chatUsers.removeUserBySocket(socket.id);
            io.to('general').emit('updateList', chatUsers.getUsersList('general'));
        });
    });
};