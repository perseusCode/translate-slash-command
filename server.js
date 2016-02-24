var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var sync = require('synchronize');
var cors = require('cors');

var privateKey  = fs.readFileSync('key.pem');
var certificate = fs.readFileSync('cert.pem');

//var credentials = {key: privateKey, cert: certificate};
var options = {
    key:    fs.readFileSync('key.pem'),
    cert:   fs.readFileSync('cert.pem'),
    requestCert:        true,
    rejectUnauthorized: false
};

// Use fibers in all routes so we can use sync.await() to make async code easier to work with.
app.use(function(req, res, next) {
  sync.fiber(next);
});

// Since Mixmax calls this API directly from the client-side, it must be whitelisted.
var corsOptions = {
  origin: /^[^.\s]+\.mixmax\.com$/,
  credentials: true
};


app.get('/typeahead', cors(corsOptions), require('./api/typeahead'));
app.get('/resolver', cors(corsOptions), require('./api/resolver'));

// app.listen(process.env.PORT || 9145);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

httpServer.listen(9145);
httpsServer.listen(9146);

