'use strict';

var
  config = {},
  acceptAllCertsRequest = require('../lib/utils/accept-all-certs-request');


// RDF Interfaces implementation + RDF-Ext
global.rdf = config.rdf = require('rdf-interfaces');
require('rdf-ext')(config.rdf);

/*config.rdf = new (require('rdf_js_interface')).RDFEnvironment();
//require('rdf-ext')(config.rdf, {replaceMerge:true});*/

/*config.rdf = require('node-rdf').environment;
require('rdf-ext')(config.rdf);*/

// persistence store
config.store = new config.rdf.InMemoryStore();

/*config.store = new config.rdf.SparqlStore({
  'endpointUrl': 'http://localhost:3030/ds/query',
  'updateUrl': 'http://localhost:3030/ds/update'
});*/

// initial graph data
config.graphs = {
  'https://localhost:8443/.access': './data/access.ttl',
  'https://localhost:8443/card': './data/card.ttl'
};

// WebID
config.webid = {
  'iri': 'https://localhost:8443/card#me',
  'keyFile': './data/webid.key',
  'certFile': './data/webid.crt',
  'pkcs12File': './data/webid.p12'
};

// Authentication
config.authn = {
  'enableWebId': true,
  'enableSessionLogin': true
};

// UAC
config.uac = {
  'disable': true,
  'graph': 'https://localhost:8443/.access'
};

// LDP
config.ldp = {
  'defaultAgent': 'https://localhost:8443/anonymous#me'
};

// tls
config.tls = {
  'disable': true,
  'keyFile': './data/localhost.key',
  'certFile': './data/localhost.crt'
};

// CORS proxy
config.cors = {
  'request': acceptAllCertsRequest
};

config.session = {
  'secret': '1234567890'
};

// core
config.core = {
  'host': 'localhost',
  'port': '8080',
  'basePath': '',
  'proxy': false
};

// BoomerangJS
config.boomerang = {
  'url': 'http://localhost:8080/boomerang',
  'apps': [{
    'id': 'pi',
    'base': 'http://localhost:8080/apps/pi/',
    'path': 'boomerang-app/example/pi/files/pi.js'
  }]
};

module.exports = config;
