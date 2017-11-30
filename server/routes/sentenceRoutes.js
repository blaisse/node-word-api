const Sentence = require('./../models/sentence');
const User = require('./../models/user');

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
            let pushed = false;
            if(item.indexOf("'") !== -1){
                pushed = true;
                // console.log(item.split("'"));
                // console.log(item.split("'")[0]+"'");
                const s = item.split("'");
                //push both j' and habite
                slicedFully.push(s[0]+"'");
                slicedFully.push(s[1]);
            }
            if(item.indexOf("-") !== -1){
                pushed = true;
                const a = item.split("-");
                slicedFully.push(a[0]);
                slicedFully.push("-");
                slicedFully.push(a[1]);
            }
            if(item.indexOf(".") !== -1){
                pushed = true;
                const a = item.split(".");
                slicedFully.push(a[0]);
                slicedFully.push(".");
            }
            //it slices es-tu? -- work on it
            // if(item.indexOf("?") !== -1){
            //     pushed = true;
            //     const a = item.split("?");
            //     console.log('a', a);
            //     slicedFully.push(a[0]);
            //     slicedFully.push("?");
            // }
            if(!pushed){
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
        // console.log(req.body);
        let obj = new Sentence({
            level: req.body.values.level,
            sentence: req.body.values.sentence,
            lang: req.body.values.lang,
            translation: req.body.values.translation
        });
        obj.save().then(() => {
            // console.log('saved');
            res.send(obj);
        }).catch((e) => {
            res.send(e);
        });
    });

    app.get('/fetchsentence/:lang/:level/:user', (req, res) => {
        // console.log(req.params.user);
        // console.log(typeof req.params.level);
        const loggedUser = req.params.user;
        
            User.findOne({ email: req.params.user }).then((u) => {
                if(u){
                    Sentence.aggregate([
                        { $match: { lang: req.params.lang } },
                        { $match: { level: req.params.level } },
                        { $match: { translation: { $ne: u.lastCorrect['sentence'] } } },
                        { $sample: { size: 1 } }
                    ]).then((sentence) => {
                        // console.log('s', sentence);
                        let mix = mixArray(sentence);
                        let r = compareArrays(mix.slicedFully, mix.mixedFully);
                        //make sure both arrays are not the same so the question wont be 
                        //provided with an answer right away
                        while(r){
                            // console.log('pls work');
                            mix = mixArray(sentence);
                            r = compareArrays(mix.slicedFully, mix.mixedFully);
                        }
                        mix.translation = sentence[0].translation;
                        res.send(mix);
                    });
                } else {
                    Sentence.aggregate([
                        { $match: { lang: req.params.lang } },
                        { $match: { level: req.params.level } },
                        { $sample: { size: 1 } }
                    ]).then((sentence) => {
                        // console.log('s', sentence);
                        let mix = mixArray(sentence);
                        let r = compareArrays(mix.slicedFully, mix.mixedFully);
                        //make sure both arrays are not the same so the question wont be 
                        //provided with an answer right away
                        while(r){
                            // console.log('pls work');
                            mix = mixArray(sentence);
                            r = compareArrays(mix.slicedFully, mix.mixedFully);
                        }
                        mix.translation = sentence[0].translation;
                        res.send(mix);
                    });  
                }
              
            });
        
            //fetch it and slice up
           
    });
};