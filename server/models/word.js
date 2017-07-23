const mongoose = require('mongoose');

const Word = mongoose.model('Word', {
    word: {
        type: String,
        requied: true,
        minlength: 1,
        trim: true
    },
    meaning: String,
    lang: String,
    conj: [
        {
            "time": String,
            "ich": String,
            "du": String,
            "er_sie_es": String,
            "wir": String,
            "ihr": String,
            "sie_Sie": String
        }
    ]
});

module.exports = { Word };