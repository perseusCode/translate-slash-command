var key = require('../utils/key');
var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  if (!term) {
    res.json([{
      title: '<i>(enter <language> <text to translate>)</i>',
      text: req.query
    }]);
    return;
  }

  var language = term.split(" ", 1)[0];
  var userText = term.substring(language.length);
  
  var response;
  try {
    response = sync.await(request({
      url: 'https://www.googleapis.com/language/translate/v2/languages',
      qs: {
        key: key,
        target: 'en'
      },
      gzip: true,
      json: true,
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body || !response.body.data) {
    res.status(500).send('Error');
    return;
  }

  var results = _.chain(response.body.data.languages)
    .filter( function(lang) { return lang.name.toUpperCase().startsWith(language.toUpperCase()) })
    .map( function(lang) { return { title:lang.name, text:lang.language.concat(userText) }})
    .value();

  if (results.length === 0) {
    res.json([{
      title: '<i>(Unsupported Language)</i>',
      text: ''
    }]);
  } else {
    res.json(results);
  }
};
