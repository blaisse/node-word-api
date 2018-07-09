const cheerio = require('cheerio');
const axios = require('axios');

const { Word } = require('../models/word');

//Key -> scraped
//Value -> saved in DB
const mappedTenses = {
    'Présent': 'simple',
    'Passé composé': 'passe_compose',
    'Imparfait': 'Imparfait',
    'Futur': 'Futur'
};

const mappedCharacters = {
    'é': '%C3%A9',
    'ê': '%C3%AA'
};

const getTranslation = async word => {
    const sanitizedWord = word.replace(/[^a-zA-Z]/g, match => mappedCharacters[match]);
    // if(chatracter is not from a-z, check in mappedCharacters to replace?)
    const page = await axios.get(`https://www.linguee.com/english-french/search?query=${sanitizedWord}`);
    const $ = cheerio.load(page.data);
    let str = '';
    $('span.tag_wordtype').each((index, element) => {
        const wordType = $(element).text().trim();
        //if just so that it iterates only once
        if(wordType === 'verb'){
            $('div.meaninggroup').each((groupIndex, groupElement) => {
                if(groupIndex === index) {
                    $(groupElement).find('div.translation').each((i, el) => {
                        const translation = $(el).find('a.dictLink').text().trim();
                        //For now combine them into a string, later save as an array?
                        if(!str.length) str = translation;
                        else str = `${str}, ${translation}`;
                        //first 3 translations will be saved
                        if(i === 2) return false;
                    });
                }
            });
        }
    });
    return str;
};

module.exports = app => {
    app.get('/scrap', async (req, res) => {
        //Possibly switch to http://www.conjugation-fr.com/conjugate.php?verb=aller
        //user provides verb to scrap -> avoir
        //user provides tenses to scrap
        const userVerb = req.query.verb;
        if(!userVerb) return res.send('No verb provided');//status 400

        const exisitng = await Word.find({ word: userVerb });
        if(exisitng.length) return res.send(`${userVerb} is already saved`);

        const userTenses = new Set(JSON.parse(req.query.tenses));
        const page = await axios.get(`http://conjugator.reverso.net/conjugation-french-verb-${userVerb}.html`);
        const $ = cheerio.load(page.data);
        if($('#ch_divUnknownVerb').length) return res.send('Cannot find provided verb');//status 404
        const meaning = await getTranslation(userVerb);

        const verb = {
            word: userVerb,
            meaning,
            lang: 'french',
            tenses: []
        };

        $('.word-wrap-row').each( function(i) {
            const title = $(this).find('.word-wrap-title h4').text().trim();
            //i === 1, because it's the row right below the indicatif without a title
            //therefore belonging to this section
            if(title === 'Indicatif' || i === 1){
                $(this).find('.wrap-three-col').each(function(j){
                    const tenseTitle = $(this).find('.blue-box-wrap p').text().trim();
                    console.log(tenseTitle);
                    if(userTenses.has(mappedTenses[tenseTitle])){
                        const tense = {
                            tense: mappedTenses[tenseTitle],
                            conjugation: {}
                        };
                        $(this).find('li').each(function(liIndex){
                            const pronoun = $(this).find('.graytxt').text().trim();
                            let conjugatedVerb = $(this).find('.verbtxt').text().trim();
                            const helpingVerb = $(this).find('.auxgraytxt');
                            //Add: 'ai eu', 'as eu'
                            if(helpingVerb.length) conjugatedVerb = `${helpingVerb.text().trim()} ${conjugatedVerb}`;
                            //passe composse it sometimes given for both genders - female has an 'e' added. picked just one
                            if(conjugatedVerb.indexOf('/') !== -1) conjugatedVerb = conjugatedVerb.split('/')[0];
                            if(pronoun.indexOf('/') !== -1){
                                const separated = pronoun.split('/');
                                separated.forEach(item => tense.conjugation[item] = conjugatedVerb);
                                //there is no 'on' on the website, add it with 'il/elle'
                                if(separated[0] === 'il') tense.conjugation['on'] = conjugatedVerb;
                            } else {
                                // j' -> je
                                if(liIndex === 0 && pronoun === 'j\'') tense.conjugation['je'] =  conjugatedVerb;
                                else tense.conjugation[pronoun] = conjugatedVerb;
                            }
                        });
                        verb.tenses.push(tense);
                    }
                });
            } 

        });
        await new Word(verb).save();
        res.send('Verb has been saved');
    });
}