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

  /**
   * Start an app with new app utils and scheduler
   * @param appConfig
   * @returns {*}
   */
  var startApp = function (appConfig) {
    appConfig.app = new App(events.store, appConfig.base);
    appConfig.scheduler = new Scheduler(events.store, {
      scheduleBaseIri: appConfig.scheduleBaseIri,
      taskListIri: appConfig.taskListIri,
      tasksPerAgent: 10
    });

    // start application
    require(appConfig.path)(appConfig.app);

    return Promise.resolve();
  };

  /**
   * Clean the task list, scheduler and result of an app
   * @param appConfig
   * @returns {*|Promise}
   */
  var cleanApp = function (appConfig) {
    return appConfig.scheduler.clean()
      .then(function () {
        return appConfig.app.clean();
      })
      .then(function () {
        return jsonify.get(appConfig.base, context);
      })
      .then(function (appGraph) {
        if ('result' in appGraph) {
          delete appGraph.result;

          return jsonify.put(appGraph);
        } else {
          return Promise.resolve();
        }
      });
  };

  /**
   * Clean and restart an app
   * @param appConfig
   * @returns {*|Promise}
   */
  var resetApp = function (appConfig) {
    return cleanApp(appConfig)
      .then(function () { return startApp(appConfig); });
  };

  /**
   * Start all app configurations
   * @param app
   * @returns {*}
   */
  this.start = function (app) {
    config.boomerang.apps.forEach(function (appConfig) {
      startApp(appConfig);
    });

    return Promise.resolve(app);
  };

  /**
   * Init the server and all app APIs
   * @param app
   * @returns {*|Promise}
   */
  this.initApi = function (app) {
    var initApp = function (appConfig) {
      // set all app IRIs
      appConfig.releaseAssignedTasksIri = appConfig.base + 'releaseAssignedTasks';
      appConfig.resetIri = appConfig.base + 'reset';
      appConfig.scheduleBaseIri = appConfig.base + 'data/schedule';
      appConfig.taskListIri = appConfig.base + 'data/tasks#list';

      // redirect to the agent schedule list
      app.get(url.parse(appConfig.scheduleBaseIri).path, function (req, res) {
        res.redirect(appConfig.scheduler.getScheduleIri(req.session.agent));
      });

      // add schedule listener
      events.addListener('beforeGraph', function (iri, options) {
        if (iri.indexOf(appConfig.scheduleBaseIri) === 0 && iri !== appConfig.scheduleBaseIri) {
          return appConfig.scheduler.schedule(options);
        } else {
          return Promise.resolve();
        }
      });

      // release assigned tasks
      app.get(url.parse(appConfig.releaseAssignedTasksIri).path, function (req, res) {
        appConfig.scheduler.releaseAssignedTasks()
          .then(function () {
            res.satusCode = 204;
            res.end();
          })
          .catch(function (error) {
            res.statusCode = 500;
            res.end(error.stack.toString());
          });
      });

      // reset application
      app.get(url.parse(appConfig.resetIri).path, function (req, res) {
        resetApp(appConfig)
          .then(function () {
            res.satusCode = 204;
            res.end();
          })
          .catch(function (error) {
            res.statusCode = 500;
            res.end(error.stack.toString());
          });
      });

      // publish app API as Linked Data
      return jsonify.put({
        '@context': context,
        '@id': appConfig.base,
        'releaseAssignedTasks': {'@id': appConfig.releaseAssignedTasksIri},
        'reset': {'@id': appConfig.resetIri},
        'openTasks': {'@id': appConfig.scheduleBaseIri}
      });
    };

    // publish server API as Linked Data
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

  /**
   * Init BoomeranJS LDApp module
   * @param app
   * @returns {*|Promise}
   */
  this.init = function (app) {
    events = app.get('graphModule').events;
    jsonify = new rdf.JSONify(events.store);

    app.set('boomerangModule', self);

    return self.initApi(app)
      .then(function (app) { return self.start(app); });
  }
};


module.exports = BoomerangModule;