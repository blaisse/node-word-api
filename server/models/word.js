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
    tenses: [
        {
            tense: String,
            conjugation: {
                je: String,
                tu: String,
                il: String,
                elle: String,
                on: String,
                nous: String,
                vous: String,
                ils: String,
                elles: String
            }
        }
    ]
});

module.exports = { Word };