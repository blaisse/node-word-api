const { FrenchScraper } = require('../features/scraper/scraper');
const frenchScraper = new FrenchScraper();

module.exports = app => {
    //better way to handle passing res to all methods?
    //is it possible to delegate to subclass from main class? => scraper('french').noun();
    app.get('/scrap/noun', async (req, res) => frenchScraper.noun(res, req.query.noun));

    //Possibly switch to http://www.conjugation-fr.com/conjugate.php?verb=aller
    //user provides verb to scrap -> avoir
    //user provides tenses to scrap
    app.get('/scrap/verb', async (req, res) => frenchScraper.verb(res, req.query.verb, req.query.tenses));
}