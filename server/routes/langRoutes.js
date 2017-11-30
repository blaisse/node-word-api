const User = require('./../models/user');


module.exports = (app) => {
    app.post('/setlang', (req, res) => {
        // console.log('setting lang..', req.body);
        User.findOneAndUpdate({ email: req.body.username }, { lang: req.body.lang }, {new: true}).then((user) => {
            // console.log(user);
            if(!user){
                res.status(404).send();
            }
    
        });
    });
};