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
    getUsersList(room){
        let users = this.users.filter(user => user.room === room);
        let names = users.map(user => user.name);
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