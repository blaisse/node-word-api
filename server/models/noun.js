const mongoose = require('mongoose');

const Noun = mongoose.model('Noun', {
    word: String,
    article: String,
    lang: String,
    meaning: String
});

module.exports = { Noun };