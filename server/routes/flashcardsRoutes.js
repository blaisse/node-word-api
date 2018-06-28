const { Noun } = require('./../models/noun');

module.exports = (app) => {
    app.get('/flashcardnoimg/:size', (req, res) => {
        const size = req.params.size;
    
    });
    
    app.post('/fetchflashcard', (req, res) => {
    
        Noun.aggregate([
            { $match: { lang: req.body.lang, img: { "$exists": true } } },
            { $sample: { size: 2 } }
        ]).then((flashcards) => {
            
            // const x = flashcards.filter((item) => {
            //     return item.img;
            // });
            
            res.send(flashcards);
        });
        // Word.aggregate([
        //     {$sample: {size:1}}
        // ])
        // Noun.find({ lang: req.body.lang, img: { $exists: true } }).then((flashcards) => {
        //     res.send(flashcards);
        // }).catch((e) => {
        //     res.status(404).send(e);
        // });
    
        // Noun.find({ lang: req.body.lang, img: { $exists: true } }).then((flashcards) => {
        //     let num = 3;
        //     if(flashcards.length < num) num=flashcards.length;//flashcards.length
        //     let ar = [];
        //     for(let i=0;i<num;i++){
        //         let ran = Math.floor(Math.random() * num);
        //         ar.push(ran);
        //     }
        //     ar.forEach((item) => {
    
        //     });
        //    const r = [];
        //    ar.forEach((item) => {
        //      r.push(flashcards[item]);
        //    });
        //     console.log(r);
        //     res.send(r);
        // }).catch((e) => {
        //     res.status(404).send(e);
        // });
    });
};