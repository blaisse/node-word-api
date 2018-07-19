const mongoose = require('mongoose');

const Noun = mongoose.model('Noun', {
    word: String,
    gender: String,
    indefinite: String,
    definite: String,
    article: String,
    lang: String,
    meaning: String,
    img: String,
    plural: String
});

module.exports = { Noun };