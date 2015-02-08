'use strict';


var
  url = require('url'),
  App = require('boomerang-app'),
  Scheduler = require('boomerang-scheduler');

require('rdf-jsonify')(rdf);


var BoomerangModule = function (config) {
  var
    self = this,
    events,
    jsonify,
    context = {'@vocab': 'https://ns.bergnet.org/boomerang#'};

  if (!('boomerang' in config)) {
    config.boomerang = {};
  }

  if (!('apps' in config.boomerang)) {
    config.boomerang.apps = [];
  }

  var getDocument = function (iri) {
    var
      documentRegEx = /(#|\/)([^#\/]*)$/,
      iriParts = documentRegEx.exec(iri);

    return iri.substr(0, iri.length - iriParts[0].length);
  };

  var startApp = function (appConfig) {
    appConfig.app = new App(events.store, appConfig.base);
    appConfig.scheduler = new Scheduler(events.store, appConfig.taskListIri);

    // add schedule listener
    events.addListener('beforeGraph', function (iri, options) {
      if (iri === getDocument(appConfig.schedulerListIri)) {
        return appConfig.scheduler.schedule(appConfig.schedulerListIri, options);
      } else {
        return Promise.resolve();
      }
    });

    // start application
    require(appConfig.path)(appConfig.app);

    return Promise.resolve();
  };

  var cleanApp = function (appConfig) {
    return appConfig.scheduler.clean(appConfig.schedulerListIri)
      .then(function () {
        return appConfig.app.clean();
      })
      .then(function () {
        return jsonify.get(appConfig.base, context);
      })
      .then(function (appGraph) {console.log(appGraph);
        if ('result' in appGraph) {
          delete appGraph.result;

          return jsonify.put(appGraph);
        } else {
          return Promise.resolve();
        }
      });
  };

  this.start = function (app) {
    config.boomerang.apps.forEach(function (appConfig) {
      startApp(appConfig);
    });

    return Promise.resolve(app);
  };

  this.initApi = function (app) {
    var initApp = function (appConfig) {
      var
        path = url.parse(appConfig.base).path;

      appConfig.resetIri = appConfig.base + 'reset';
      appConfig.schedulerListIri = appConfig.base + 'data/schedule#list';
      appConfig.taskListIri = appConfig.base + 'data/tasks#list';

      app.get(path + 'reset', function (req, res) {
        cleanApp(appConfig)
          .then(function () {
            return startApp(appConfig);
          })
          .then(function () {
            res.satusCode = 204;
            res.end();
          })
          .catch(function (error) {
            console.error(error.stack);
          });
      });

      return jsonify.put({
        '@context': context,
        '@id': appConfig.base,
        'reset': {'@id': appConfig.resetIri},
        'openTasks': {'@id': appConfig.schedulerListIri}
      });
    };

    return jsonify.put({
      '@context': context,
      '@id': config.boomerang.url,
      'hosts': config.boomerang.apps.map(function (appConfig) {
        return {'@id': appConfig.base};
      })
    })
      .then(function () {
        return Promise.all(config.boomerang.apps.map(function (appConfig) {
          return initApp(appConfig);
        }));
      })
      .then(function () {
        return Promise.resolve(app);
      });
  };

  this.init = function (app) {
    events = app.get('graphModule').events;
    jsonify = new rdf.JSONify(events.store);

    app.set('boomerangModule', self);

    return self.initApi(app)
      .then(function (app) { return self.start(app); });
  }
};


module.exports = BoomerangModule;