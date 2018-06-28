const User = require('./../models/user');

module.exports = (app) => {
    app.post('/setlang', async (req, res) => {
        const user = await User.findOneAndUpdate({ email: req.body.username }, { lang: req.body.lang }, {new: true});
        if(user) return res.send(user.lang);  
        return res.status(404).send('Cannot set languague');
    });
};