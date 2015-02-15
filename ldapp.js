global.Promise = require('es6-promise').Promise;


var
  config = require('./data/config'),
  express = require('express'),
  path = require('path'),
  coreModule = new (require('./lib/core-module'))(config),
  authNModule = new (require('./lib/authn-module'))(config),
  graphModule = new (require('./lib/graph-module'))(config),
  listenerModule = new (require('./lib/listener-module'))(config),
  boomerangModule = new (require('./lib/boomerang-module'))(config);


coreModule.init()
  .then(function (app) { return authNModule.init(app); })
  .then(function (app) { app.use('/', express.static(path.join(__dirname, 'public/'))); return app; })
  .then(function (app) { app.use('/client/', express.static(path.join(__dirname, 'node_modules/boomerang-client/dist/'))); return app; })
  .then(function (app) { app.use('/apps/', express.static(path.join(__dirname, 'node_modules/boomerang-app/example/'))); return app; })
  .then(function (app) { return graphModule.init(app); })
  .then(function (app) { return listenerModule.init(app); })
  .then(function (app) { return boomerangModule.init(app); })
  .catch(function (error) {
    console.error(error.stack);
  });