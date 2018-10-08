var log4js = require('log4js');
const express = require('express');
var fs = require('fs');
const app = express();

var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

var log = log4js.getLogger('app');

// Settings
const config = require('./properties/config.properties')
const log4jsProperties = require('./properties/log4js.properties')

// Routes
const api = require('./routes/items.router')

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://127.0.0.1:3000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// /// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));

app.use(express.json())
app.use('/api', api)

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        log.error('Something went wrong:', err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    log.error('Something went wrong:', err);
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/**
 * Initialise log4js first, so we don't miss any log messages
 */
var log4js = require('log4js');
log4js.configure(log4jsProperties.products);

var log = log4js.getLogger('startup');



try {
    require('fs').mkdirSync('./log');
  } catch (e) {
    if (e.code != 'EEXIST') {
      console.error('Could not set up log directory, error was: ', e);
      process.exit(1);
    }
  }


// httpServer.listen(8080);
// httpsServer.listen(3001);
httpsServer.listen(config.port, () => {
    log.info(`API Server MLA in http://localhost:${config.port}`)
});

module.exports = app