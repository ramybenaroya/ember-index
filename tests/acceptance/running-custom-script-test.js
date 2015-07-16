import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../../tests/helpers/start-app';
import config from '../../config/environment';
import $ from 'jquery';
var application;

module('Acceptance | running custom script', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /running-custom-script', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
  });
});

test('Coloring the body with ember-index', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal($(config.APP.rootElement).css('background-color'), config.coloringScript.color);
  });
});
