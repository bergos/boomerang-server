'use strict';

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PromiseEvent = factory();
  }
})(this, function () {
  var PromiseEvent = function () {
  };

  PromiseEvent.prototype = {
    addListener: function (event, listener) {
      this._events = this._events || {};
      this._events[event] = this._events[event] || [];
      this._events[event].push(listener);
    },
    removeListener: function (event, listener) {
      this._events = this._events || {};

      if (event in this._events === false) {
        return;
      }

      this._events[event].splice(this._events[event].indexOf(listener), 1);
    },
    emit: function (event) {
      var
        self = this,
        current = 0,
        listeners,
        parameters = Array.prototype.slice.call(arguments, 1);

      this._events = this._events || {};

      if (event in this._events === false) {
        return Promise.resolve();
      }

      listeners = this._events[event];

      return new Promise(function (resolve) {
        var next = function () {
          if (current === listeners.length) {
            return resolve();
          }

          var listener = listeners[current++];

          if (listener.length > parameters.length) {
            listener.apply(self, parameters.concat([next]));
          } else {
            Promise.resolve()
              .then(function () { return listener.apply(self, parameters); })
              .then(function () { next(); });
          }
        };

        next();
      });
    }
  };

  PromiseEvent.mixin = function (target) {
    var props = ['addListener', 'removeListener', 'emit'];

    for (var i = 0; i < props.length; i++) {
      if (typeof target === 'function') {
        target.prototype[props[i]] = PromiseEvent.prototype[props[i]];
      } else {
        target[props[i]] = PromiseEvent.prototype[props[i]];
      }
    }
  };

  return PromiseEvent;
});