'use strict';

var
  acceptAllCertsRequest = require('./utils/accept-all-certs-request'),
  uuid = require('uuid'),
  Promise = require('es6-promise').Promise,
  PubkeyLogin = require('pubkey-login');


var AuthNModule = function (config) {
  var self = this;

  var initPubkeyLogin = function (app) {
    if (!config.enableWebId) {
      return Promise.resolve();
    }

    //TODO: request should be configurable
    var store = new config.rdf.LdpStore(
      {'request': acceptAllCertsRequest});

    self.pubkeyLogin = new PubkeyLogin({'rdf': config.rdf, 'store': store});

    app.use(self.pubkeyLogin.middleware);

    return Promise.resolve(app);
  };

  var initSessionLogin = function (app) {
    if (!config.enableSessionLogin) {
      return Promise.resolve();
    }

    var agents = {};

    app.use(function (req, res, next) {
      if (!(req.sessionID in agents)) {
        agents[req.sessionID] = 'urn:uuid:' + uuid().toString();
      }

      req.session.agent = agents[req.sessionID];

      next();
    });

    return Promise.resolve(app);
  };

  var initAssertion = function (app) {
    app.use('/login-assertion', self.pubkeyLogin.assertionMiddleware);

    return Promise.resolve(app);
  };

  self.init = function (app) {
    return initPubkeyLogin(app)
      .then(function () { return initSessionLogin(app); })
      .then(function () { return initAssertion(app); });
  };
};


module.exports = AuthNModule;