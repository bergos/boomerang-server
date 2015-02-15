var
  fs = require('fs'),
  nodeExec = require('child_process').exec,
  path = require('path');


var copyModule = function (module, target) {
  var
    fullTarget = path.join(__dirname, target),
    modulePath = require.resolve(module);

  if (!fs.existsSync(fullTarget)) {
    exec('cp ' + modulePath + ' ' + fullTarget);
  }
};


var exec = function (command) {
  nodeExec(command, function (error, stdout, stderr) {
    if (error != null) {
      console.error('error running command: ' + error.stack);
      process.exit(error.code);
    }

    if (stderr.length !== 0) {
      console.error(stderr.toString());
      process.exit(1);
    }

    if (stdout.length !== 0) {
      console.log(stdout.toString());
    }
  });
};


var linkModule = function (module, target) {
  var
    fullTarget = path.join(__dirname, target),
    modulePath = path.relative(path.dirname(fullTarget), require.resolve(module));

  if (!fs.existsSync(fullTarget)) {
    exec('ln -s ' + modulePath + ' ' + fullTarget);
  }
};


var mkdir = function (dir) {
  dir = path.join(__dirname, dir);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};


var rmdir = function (dir) {
  dir = path.join(__dirname, dir);

  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir);
  }
};


var unlink = function (file) {
  file = path.join(__dirname, file);

  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
};


var toCopy = {
  'boomerang-client/lib/utils/request.js': 'public/js/request.js',
  'bootstrap/dist/css/bootstrap.css': 'public/css/bootstrap.css',
  'bootstrap/dist/css/bootstrap.css.map': 'public/css/bootstrap.css.map',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.eot': 'public/fonts/glyphicons-halflings-regular.eot',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.svg': 'public/fonts/glyphicons-halflings-regular.svg',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.ttf': 'public/fonts/glyphicons-halflings-regular.ttf',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.woff': 'public/fonts/glyphicons-halflings-regular.woff',
  'bootstrap/dist/fonts/glyphicons-halflings-regular.woff2': 'public/fonts/glyphicons-halflings-regular.woff2',
  'bootstrap/dist/js/bootstrap.js': 'public/js/bootstrap.js',
  'jquery/dist/jquery.js': 'public/js/jquery.js',
  'jsonld/js/jsonld.js': 'public/js/jsonld.js',
  'promiseevent': 'public/js/promiseevent.js',
  'react/dist/react.js': 'public/js/react.js'
};


var clean = function () {
  Object.keys(toCopy).forEach(function (source) {
    unlink(toCopy[source]);
  });

  rmdir('public/css');
  rmdir('public/fonts');
};


var build = function () {
  mkdir('public/css');
  mkdir('public/fonts');

  Object.keys(toCopy).forEach(function (source) {
    copyModule(source, toCopy[source]);
  });
};


switch(process.argv[2]) {
  case 'clean':
    clean();
    break;

  case 'build':
    build();
    break;

  default:
    clean();
    build();
}