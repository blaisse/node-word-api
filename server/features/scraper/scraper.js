const cheerio = require('cheerio');
const axios = require('axios');

const { Word } = require('../../models/word');
const { Noun } = require('../../models/noun');

class Scraper {
    image(word){
        console.log('scraping an image for..', word);
    }
}

class FrenchScraper extends Scraper {
    constructor(props){
        super(props);
        this.language = 'french';
        //Key -> scraped
        //Value -> saved in DB
        this.mappedCharacters = {
            'é': '%C3%A9',
            'ê': '%C3%AA'
        };
        this.mappedTenses = {
            'Présent': 'simple',
            'Passé composé': 'passe_compose',
            'Imparfait': 'Imparfait',
            'Futur': 'Futur'
        };
    }
    //it's somewhat similar to scraping a noun. could be refactored
    async getTranslation(word){
        const sanitizedWord = word.replace(/[^a-zA-Z]/g, match => this.mappedCharacters[match]);
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
    }
    async verb(res, userVerb, providedTenses){
        if(!userVerb) return res.send('No verb provided');//status 400

        const exisitng = await Word.find({ word: userVerb });
        if(exisitng.length) return res.send(`${userVerb} is already saved`);

        const userTenses = new Set(JSON.parse(providedTenses));
        const page = await axios.get(`http://conjugator.reverso.net/conjugation-french-verb-${userVerb}.html`);
        const $ = cheerio.load(page.data);
        if($('#ch_divUnknownVerb').length) return res.send('Cannot find provided verb');//status 404
        const meaning = await this.getTranslation(userVerb);
        const scraper = this;

        const verb = {
            word: userVerb,
            meaning,
            lang: this.language,
            tenses: []
        };

        $('.word-wrap-row').each( function(i) {
            const title = $(this).find('.word-wrap-title h4').text().trim();
            //i === 1, because it's the row right below the indicatif without a title
            //therefore belonging to this section
            if(title === 'Indicatif' || i === 1){
                $(this).find('.wrap-three-col').each(function(j){
                    const tenseTitle = $(this).find('.blue-box-wrap p').text().trim();
                    // console.log(tenseTitle);
                    if(userTenses.has(scraper.mappedTenses[tenseTitle])){
                        const tense = {
                            tense: scraper.mappedTenses[tenseTitle],
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
    }
    async noun(res, userNoun){
        if(!userNoun) return res.send('No noun provided');
        const exists = await Noun.findOne({ word: userNoun });
        if(exists) return res.send('Noun is already saved');
        const sanitizedWord = userNoun.replace(/[^a-zA-Z]/g, match => this.mappedCharacters[match]);
        const page = await axios.get(`https://www.linguee.com/english-french/search?source=auto&query=${sanitizedWord}`);
        const $ = cheerio.load(page.data);
        const noun = {
            word: userNoun,
            lang: this.language
        };
        //provide french noun
        $('.tag_wordtype').each((index, element) => {
            const type = $(element).text().trim();
            if(type.slice(0, 5) === 'noun,'){
                //['noun', 'feminine']
                const typeSplit = type.split(',');

                noun.gender = typeSplit[1].trim();
                if(noun.gender === 'feminine'){
                    noun.indefinite = 'une';
                    noun.definite = 'la';
                } else {
                    noun.indefinite = 'un';
                    noun.definite = 'le';
                }
                const plural = $('span.tag_forms.forms_plural').first().find('a.formLink').text().trim();
                noun.plural = plural;
                let translation = '';
                $('a.dictLink.featured').each((translationIndex, translationElement) => {
                    if(translationIndex === 3) return false;
                    const oneTranslation = $(translationElement).text().trim();
                    if(!translation.length) translation = oneTranslation;
                    else translation = `${translation}, ${oneTranslation}`;
                });
                noun.meaning = translation;
            }
            return false;
        })
        //save
        await new Noun(noun).save();
        res.send('Noun has been saved');
    }
}

module.exports = { FrenchScraper };