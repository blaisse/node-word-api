const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SentenceSchema = new Schema({
    level: String,
    sentence: String,
    lang: String
});

const Sentence = mongoose.model('sentence', SentenceSchema);
module.exports = Sentence;