const jwt = require('jwt-simple');
const User = require('./../models/user');

function encodeToken(user){
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timestamp }, process.env.SECRET);
}

function decodeToken(token){

}

exports.signup = function(req, res, next){
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password) return res.status(422).send({ error: "Provide all fields" });
    
    User.findOne({ email }).then((user) => {
        if(user){
            return res.status(422).send({ error: "Email in use" });
        }
        const u = new User({ email, password });
        u.save().then(() => {
            res.json({ token: encodeToken(u) });
        }).catch((e) => {
            res.status(422).send(e);
        });
    }).catch((e) => {
        res.send(e);
    });
}

exports.signin = function(req, res, next){
    // console.log(req.user.email);
    res.send({ token: encodeToken(req.user), username: req.user.email });
}