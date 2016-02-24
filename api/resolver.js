var key = require('../utils/key');
var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The API that returns the in-email representation.
module.exports = function(req, res) {
  // If user types fast translate API will return 400.
  // This case can be handled easily, by trying to convert the language name to proper code.
  // This case is not being handled here.
  var term = req.query.text.trim();

  var languageCode = term.split(" ", 1)[0];
  var userText = term.substring(languageCode.length);

  var response;
  try {
    response = sync.await(request({
      url: 'https://www.googleapis.com/language/translate/v2',
      qs: {
        key: key,
        target: languageCode,
        q: userText
      },
      gzip: true,
      json: true,
      timeout: 15 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body || !response.body.data || response.body.data.translations.length != 1) {
    res.status(500).send('Error');
    return;
  }

  res.json({
    body: response.body.data.translations[0].translatedText,
    raw:true
  });
};