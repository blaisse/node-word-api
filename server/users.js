class Users {
    constructor(){
        this.users = [];
    }
    addUser(id, name, room){
        let user = { id, name, room };
        this.users.push(user);
        return user;
    }
    getUser(id){
        return this.users.filter(user => user.id === id)[0];
    }
    getUserByName(name){
        return this.users.filter(user => user.name === name)[0];
    }
    addMessage(user){
        // return
    }
    getUsersList(room, username){
        // console.log('u', username, this.users);
        let users = this.users.filter(user => user.room === room);
        // let users2 = users.filter(user => user.name !== username);
        let names = users.map(user => user.name);
        // console.log('names', username, names);
        return names;
    }
    removeUserByName(name){
        let users = this.users.filter(user => user.name !== name);
        this.users = users;
        return users;
    }
    removeUserBySocket(id){
        let user = this.users.filter(user => user.id === id)[0];
        if(user){
            this.users = this.users.filter(u => u.id !== id);
        }
        return user;
    }
}

module.exports = { Users };