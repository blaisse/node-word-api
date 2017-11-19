const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FlashcardSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'user' },
    title: String,
    cards: [{ front: String, back: String }]
});

const Flashcard = mongoose.model('flashcard', FlashcardSchema);

module.exports = Flashcard;