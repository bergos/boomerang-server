'use strict';

var
  PromiseEvent = require('promiseevent');


var EventStore = function (store) {
  var self = this;

  this.store = new rdf.promise.Store(store);

  PromiseEvent.mixin(self);

  this.graph = function (iri, callback, options) {
    self.emit('beforeGraph', iri, options)
      .then(function () { return self.store.graph(iri, options); })
      .then(function (result) {
        self.emit('afterGraph', iri, options)
          .then(function () { callback(result); });
      });
  };

  this.match = function (iri, subject, predicate, object, callback, limit, options) {
    self.emit('beforeMatch', iri, subject, predicate, object, limit, options)
      .then(function () { return self.store.match(iri, subject, predicate, object, limit, options); })
      .then(function (result) {
        self.emit('afterMatch', iri, subject, predicate, object, limit, options)
          .then(function () { callback(result); });
      });
  };

  this.add = function (iri, graph, callback, options) {
    self.emit('beforeAdd', iri, graph, options)
      .then(function () { return self.store.add(iri, graph, options); })
      .then(function (result) {
        self.emit('afterAdd', iri, graph, options)
          .then(function () { self.emit('changed', iri, options); })
          .then(function () { callback(result); });
      });
  };

  this.merge = function (iri, graph, callback, options) {
    self.emit('beforeMerge', iri, graph, options)
      .then(function () { return self.store.merge(iri, graph, options); })
      .then(function (result) {
        self.emit('afterMerge', iri, graph, options)
          .then(function () { self.emit('changed', iri, options); })
          .then(function () { callback(result); });
      });
  };

  this.remove = function (iri, graph, callback, options) {
    self.emit('beforeRemove', iri, graph, options)
      .then(function () { return self.store.remove(iri, graph, options); })
      .then(function (result) {
        self.emit('afterRemove', iri, graph, options)
          .then(function () { self.emit('changed', iri, options); })
          .then(function () { callback(result); });
      });
  };

  this.removeMatches = function (iri, subject, predicate, object, callback, options) {
    self.emit('beforeRemoveMatches', iri, subject, predicate, object, options)
      .then(function () { return self.store.removeMatches(iri, subject, predicate, object, options); })
      .then(function (result) {
        self.emit('afterRemoveMatches', iri, subject, predicate, object, options)
          .then(function () { self.emit('changed', iri, options); })
          .then(function () { callback(result); });
      });
  };

  this.delete = function (iri, callback, options) {
    self.emit('beforeDelete', iri, options)
      .then(function () { return self.store.delete(iri, options); })
      .then(function (result) {
        self.emit('afterDelete', iri, options)
          .then(function () { self.emit('changed', iri, options); })
          .then(function () { callback(result); });
      });
  };
};


module.exports = EventStore;