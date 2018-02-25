/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'dummy',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    coloringScript: {
      color: 'rgb(186, 218, 85)'
    },
    'ember-index': {
      content: [{
        key: '1',
        file: '_emberIndexContent/file1.txt',
        includeInOutput: false,
        includeInIndexHtml: true
      }, {
        key: '2',
        file: '_emberIndexContent/file2.txt',
        includeInOutput: true,
        includeInIndexHtml: true
      }, {
        key: '3',
        file: '_emberIndexContent/file3.txt',
        includeInOutput: true,
        includeInIndexHtml: false
      }, {
        key: '4',
        file: '_emberIndexContent/file4.txt',
        includeInOutput: true,
        includeInIndexHtml: false
      },
      {
        key: '5',
        string: '<!-- content from string -->',
        includeInOutput: false,
        includeInIndexHtml: true
      }, 
      {
        key: 'coloring-script',
        file: '_emberIndexContent/coloring-script.txt',
        includeInOutput: false,
        includeInIndexHtml: true
      }],
      output: 'index2.html'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};