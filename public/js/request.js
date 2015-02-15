(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.request = factory();
  }
}(this, function () {
  var
    isNode = (typeof process !== 'undefined' && process.versions && process.versions.node),
    request = null,
    promiseRequest = null;

  if (isNode) {
    var
      http = require('http'),
      https = require('https'),
      url = require('url');

    request = function (method, requestUrl, headers, content, callback) {
      var
        options = url.parse(requestUrl),
        client = http;

      options.hash = null;
      options.method = method;
      options.headers = headers;

      if (options.protocol === 'https:') {
        client = https;

        if ('acceptAllCerts' in request && request.acceptAllCerts) {
          options.rejectUnauthorized = false;
        }
      }

      var req = client.request(options, function (res) {
        var resContent = '';

        res.setEncoding('utf8');
        res.on('data', function (chunk) { resContent += chunk; });
        res.on('end', function () { callback(res.statusCode, res.headers, resContent); });
      });

      req.on('error', function (error) { callback(null, null, null, error); });

      if (content != null) {
        req.write(content);
      }

      req.end();
    };
  } else {
    request = function (method, requestUrl, headers, content, callback) {
      var
        xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function () {
        if (xhr.readyState === xhr.DONE) {
          var
            headerLines = xhr.getAllResponseHeaders().split('\r\n'),
            resHeaders = {};

          for (var i = 0; i < headerLines.length; i++) {
            var headerLine = headerLines[i].split(': ', 2);
            resHeaders[headerLine[0].toLowerCase()] = headerLine[1];
          }

          callback(xhr.status, resHeaders, xhr.responseText);
        }
      };

      xhr.open(method, requestUrl, true);

      for (var header in headers) {
        xhr.setRequestHeader(header, headers[header]);
      }

      xhr.send(content);
    };
  }

  // use Promise if supported
  if (typeof Promise === 'undefined') {
    return request;
  }

  promiseRequest = function (method, url, requestHeaders, requestContent) {
    return new Promise(function (resolve, reject) {
      request(method, url, requestHeaders, requestContent,
        function (statusCode, responseHeaders, responseContent, error) {
          var response = {
            statusCode: statusCode,
            headers: responseHeaders,
            content: responseContent
          };

          if (statusCode < 200 || statusCode >= 300) {
            return reject('status code: ' + statusCode);
          }

          if (error != null) {
            return reject('error during request: ' + error);
          }

          resolve(response);
        }
      );
    });
  };

  promiseRequest.request = request;

  return promiseRequest;
}));