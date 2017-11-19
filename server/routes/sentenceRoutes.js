const Sentence = require('./../models/sentence');

function checkRand(ar, randomNumber){
    //Cannot break forEach...
    // ar.forEach((item) => {
    //     console.log(item, randomNumber);
    //     if(randomNumber === item){
    //         return false;
    //     }
    // });
    // return true;

    if(ar.length > 0){
        let result = ar.every((item) => {
            return item !== randomNumber;
        });
        return result;
    }
    return true;
}

function compareArrays(ar1, ar2){
    return ar1.every((item, index) => {
        return item === ar2[index];
    });
}

function mixArray(sentence){
        //slice the sentence up
        let sliced = sentence[0].sentence.split(" ");
        // console.log(sentence[0].sentence);
        let slicedFully = [];
        sliced.forEach((item) => {
            // slicedFully.push(item.split(/(?=')/g));
            if(item.indexOf("'") !== -1){
                // console.log(item.split("'"));
                // console.log(item.split("'")[0]+"'");
                const s = item.split("'");
                //push both j' and habite
                slicedFully.push(s[0]+"'");
                slicedFully.push(s[1]);
            } else {
                slicedFully.push(item);
            }
        });
        // console.log('sliced', slicedFully);
        //mix the words up
        let mixed = [];
        slicedFully.forEach((item) => {
            let i;
            let pass = false;
            while(!pass){
                i = Math.floor(Math.random() * slicedFully.length);
                pass = checkRand(mixed, i);
                // console.log('passed', pass);
            }
            checkRand(mixed, 1);
            mixed.push(i);
            // console.log('me is mixed', mixed);
        });
        //mixed array consists of indexes, i need words.
        let mixedFully = [];
        mixed.forEach((randIndex) => {
            mixedFully.push(slicedFully[randIndex]);
        });
        // console.log(mixed);
        // console.log(mixedFully);
        return {mixedFully, slicedFully};
}

module.exports = (app) => {

    app.post('/savesentence', (req, res) => {
        res.send(req.body);
        let obj = new Sentence({
            level: req.body.level,
            sentence: req.body.sentence,
            lang: req.body.lang
        });
        obj.save().then(() => {
            console.log('saved');
        });
    });

    app.get('/fetchsentence/:lang/:level', (req, res) => {
        // console.log(typeof req.params.level);
        //fetch it and slice up
        Sentence.aggregate([
            { $match: { lang: req.params.lang } },
            { $match: { level: req.params.level } },
            { $sample: { size: 1 } }
        ]).then((sentence) => {
            let mix = mixArray(sentence);
            let r = compareArrays(mix.slicedFully, mix.mixedFully);
            //make sure both arrays are not the same so the question wont be 
            //provided with an answer right away
            while(r){
                // console.log('pls work');
                mix = mixArray(sentence);
                r = compareArrays(mix.slicedFully, mix.mixedFully);
                // console.log('working', r, mix);
            }
            res.send(mix);
        });
    });
};