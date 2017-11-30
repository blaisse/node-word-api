const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SentenceSchema = new Schema({
    level: String,
    sentence: {type: String, unique: true},
    lang: String,
    translation: String
});

const Sentence = mongoose.model('sentence', SentenceSchema);
module.exports = Sentence;