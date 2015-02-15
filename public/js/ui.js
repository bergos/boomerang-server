var propertyToArray = function (obj, property) {
  if (obj == null || !(property in obj)) {
    return [];
  }

  return Array.isArray(obj[property]) ? obj[property] : [obj[property]];
};


var ApplicationList = React.createClass({
  trigger: function (url) {
    return request('GET', url, 'application/ld+json');
  },
  releaseAssignedTasks: function (app) {
    var self = this;

    self.trigger(app.releaseAssignedTasks['@id'])
      .then(function () {
        window.alert('release assigned tasks sent');

        return self.props.controller.emit('applications:actionSent');
      });
  },
  resetApp: function (app) {
    var self = this;

    self.trigger(app.reset['@id'])
      .then(function () {
        window.alert('reset sent');

        return self.props.controller.emit('applications:actionSent');
      });
  },
  getInitialState: function () {
    var
      self = this;

    self.props.controller.addListener('applications:updated', function (apps) {
      self.setState({apps: apps});
    });

    return {
      apps: []
    }
  },
  render: function () {
    var
      self = this,
      head,
      body;

    var actionButtons = function (app) {
      var buttons = [];

      if ('releaseAssignedTasks' in app) {
        buttons.push(
          React.DOM.button({
              key: 'releaseAssignedTasks',
              className: 'btn btn-sm btn-default',
              onClick: self.releaseAssignedTasks.bind(self, app),
              title:'release assigned tasks'
            },
            React.DOM.span({className: 'glyphicon glyphicon-random', ariaHidden: true}))
        );
      }

      if ('reset' in app) {
        buttons.push(
          React.DOM.button({
              key: 'reset',
              className: 'btn btn-sm btn-default',
              onClick: self.resetApp.bind(self, app),
              title:'reset'
            },
            React.DOM.span({className: 'glyphicon glyphicon-trash', ariaHidden: true}))
        );
      }

      return buttons;
    };

    head = React.DOM.thead({},
      React.DOM.tr({},
        React.DOM.th({className: 'col-xs-5'}, 'Application'),
        React.DOM.th({className: 'col-xs-6'}, 'Result'),
        React.DOM.th({className: 'col-xs-1'}, 'Actions')));

    body = React.DOM.tbody({},
      self.state.apps.map(function (app) {
        return React.DOM.tr({key: app['@id']},
          React.DOM.td({},
            React.DOM.a({href: app['@id']}, app['@id'])),
          React.DOM.td({style: {wordBreak: 'break-all'}}, 'result' in app ? app.result : ''),
          React.DOM.td({}, actionButtons(app)))
      }));

    return React.DOM.table({className: 'table table-bordered'}, head, body);
  }
});

var createApplicationList = React.createFactory(ApplicationList);


var BoomerangControl = function (iri) {
  var
    self = this,
    applicationList;

  this.context = {'@vocab': 'https://ns.bergnet.org/boomerang#'};

  this.refreshApplications = function () {
    var fetch = function (url) {
      return request('GET', url, {Accept: 'application/ld+json'})
        .then(function (response) {
          return jsonld.promises().compact(JSON.parse(response.content), self.context);
        });
    };

    fetch(iri)
      .then(function (serverInfo) {
        var fetchApplications = propertyToArray(serverInfo, 'hosts').map(function (appLink) {
          return fetch(appLink['@id']);
        });

        Promise.all(fetchApplications)
          .then(function (applicationInfos) {
            self.emit('applications:updated', applicationInfos);
          });
      })
      .catch(function (error) {
        console.error(error.stack);
      });
  };

  PromiseEvent.mixin(self);

  applicationList = createApplicationList({controller: self});

  React.render(applicationList, document.getElementById('application-list'));

  self.refreshApplications();

  $('#refresh').on('click', function () {
      self.refreshApplications();
    });

  self.addListener('applications:actionSent', function () {
    setTimeout(self.refreshApplications.bind(self), 500);

  });
};

var control = new BoomerangControl('/boomerang');