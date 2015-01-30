'use strict';


var
  App = require('boomerang-app'),
  Scheduler = require('boomerang-scheduler');


var BoomerangModule = function (config) {
  var getDocument = function (iri) {
    var
      documentRegEx = /(#|\/)([^#\/]*)$/,
      iriParts = documentRegEx.exec(iri);

    return iri.substr(0, iri.length - iriParts[0].length);
  };

  var startApp = function (appConfig, events) {
    var
      schedulerListIri = appConfig.base + 'data/schedule#list',
      taskListIri = appConfig.base + 'data/tasks#list',
      boomerangApp = new App(events.store, appConfig.base),
      scheduler = new Scheduler(events.store, taskListIri);

    // add schedule listener
    events.addListener('beforeGraph', function (iri, options) {
      if (iri === getDocument(schedulerListIri)) {
        return scheduler.schedule(schedulerListIri, options);
      } else {
        return Promise.resolve();
      }
    });

    // start application
    require(appConfig.path)(boomerangApp);
  };

  this.init = function (app) {
    var
      events = app.get('graphModule').events;

    if ('boomerang' in config && 'apps' in config.boomerang) {
      config.boomerang.apps.forEach(function (appConfig) {
        startApp(appConfig, events);
      });
    }
  }
};


module.exports = BoomerangModule;