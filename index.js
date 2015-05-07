/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');

var renameFiles = require('broccoli-rename-files');
var mergeTrees = require('broccoli-merge-trees');
var funnel = require('broccoli-funnel');
var removeFiles = require('broccoli-file-remover');
var replaceString = require('broccoli-string-replace');

var assign = require('object-assign');
var colors = require('colors');

var MARKER_PREFIX = 'ember-index';

module.exports = {
	name: 'ember-index',

	contentFor: function(type, config) {
		var contentId,
			strings;

		if (this.options.enabled && this.options.content) {
			this.options.content.forEach(function(content) {
				var startMarker = this._getStartMarker(content.id),
					endMarker = this._getEndMarker(content.id),
					auxTree,
					contentFilePath;

				auxTree = funnel(this.app.options.trees.app, {
					srcDir: '.',
					files: [content.file],
					destDir: '.'
				});

				contentFilePath = path.join(auxTree.inputTree, content.file);
				if (fs.existsSync(contentFilePath)) {
					strings[content.id] = startMarker + fs.readFileSync(contentFilePath) + endMarker;
				} else {
					console.error(('ember-index addon: Cannot find ' + contentFilePath).red);
				}
			}.bind(this));
		}

		if (/^ember-index/.test(type)) {
			if (type === 'ember-index') {
				contentId = 'default';
			} else {
				contentId = type.substring('ember-index-'.length, type.length);
			}
		}
		return strings[contentId];
	},

	included: function(app) {
		this._super.included.apply(this, arguments);
		this.options = assign({}, this._defaultOptions, (app.options['ember-index'] || {}));

		this.options.content = util.isArray(this.options.content) ? this.options.content : (this.options.content ? [assign({
			id: 'default'
		}, this.options.content)] : []);

		this.validateOptions();
	},

	postprocessTree: function(type, tree) {
		var returnedTree = tree,
			renamedIndexTree,
			indexTree;

		if (this.options.enabled && this.options.output && type === 'all') {

			renamedIndexTree = renameFiles(funnel(tree, {
				srcDir: '.',
				files: ['index.html'],
				destDir: '.'
			}), {
				transformFilename: function() {
					return this.options.output;
				}.bind(this)
			});

			indexTree = funnel(tree, {
				srcDir: '.',
				files: ['index.html'],
				destDir: '.'
			});

			this.options.content.forEach(function(content) {
				var startMarker = this._getStartMarker(content.id);
				var endMarker = this._getEndMarker(content.id);
				var markersRegExp = new RegExp('(' + startMarker + '|' + endMarker + ')', 'g');
				var injectedContentRegExp = new RegExp(startMarker + '(.*)' + endMarker, 'g');

				renamedIndexTree = replaceString(renamedIndexTree, {
					files: [this.options.output],
					pattern: {
						match: content.includeInOutput ? markersRegExp : injectedContentRegExp,
						replacement: ''
					}
				});

				indexTree = replaceString(indexTree, {
					files: ['index.html'],
					pattern: {
						match: content.includeInIndexHtml ? markersRegExp : injectedContentRegExp,
						replacement: ''
					}
				});

			}, this);

			returnedTree = mergeTrees([tree, indexTree, renamedIndexTree], {
				overwrite: true
			});
		}

		return returnedTree;
	},

	validateOptions: function() {
		if (this.options.output === 'index.html') {
			throw new Error('ember-index: Output file name cannot be \'index.html\'');
		}
	},

	_defaultOptions: {
		enabled: true,
		content: [],
		output: null,
	},

	_startMarkerPrefix: MARKER_PREFIX + '-start-' + new Date().getTime(),

	_endMarkerPrefix: MARKER_PREFIX + '-end-' + new Date().getTime(),

	_getStartMarker: function(id) {
		return this._startMarkerPrefix + '-' + id;
	},

	_getEndMarker: function(id) {
		return this._endMarkerPrefix + '-' + id;
	}

};