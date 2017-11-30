const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    lang: { type: String, default: 'french' },
    flashcards: [{ type: Schema.Types.ObjectId, ref: 'flashcard' }],
    lastCorrect: { type: Schema.Types.Mixed, default: { noun: "zz", verb: "zz" } }    
});

userSchema.pre('save', function(next){
    // console.log('user email schema: ', this.email);
    //check whether it's a new user or .save() - it would call .pre() again
    //and change hash
    modelClass.findOne({ email: this.email }).then((found) => {
        if(!found){
            const user = this;
            bcrypt.genSalt(10, function(err, salt){
                if(err) return next(err);
                bcrypt.hash(user.password, salt, null, function(err, hash){
                    if(err) return next(err);
                    user.password = hash;
                    next();
                });
            });
        } else {
            next();
        }
    });
});//$2a$10$31S8bHO6oQ5cRVCe5b7Pk.Jq8w8qPKGJS/S9DbUzlLekwE8v5T5Na
userSchema.methods.comparePasswords = function(inputPassword, callback){
    // console.log(inputPassword, this.password);
    bcrypt.compare(inputPassword, this.password, function(err, isMatch){
        // console.log(isMatch);
        if(err){
            // console.log('err?');
            return callback(err);//+r
        }
        // console.log('matching?', isMatch);//FALSE?
        callback(null, isMatch);
    });
}

const modelClass = mongoose.model('user', userSchema);

module.exports = modelClass;
// module.exporrs = { User };
