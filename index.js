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
var deprecate = require('ember-cli/lib/utilities/deprecate');

var MARKER_PREFIX = 'ember-index';

module.exports = {
	name: 'ember-index',

	contentFor: function(type, config) {
		var contentKey,
			strings = {};
		if (this.options.enabled && this.options.content) {
			this.options.content.forEach(function(content) {
				var key = content.key || content.id;
				var startMarker = this._getStartMarker(key);
				var endMarker = this._getEndMarker(key);
				var	contentFilePath = path.join(this.app.project.root, this.app.options.trees.app, content.file);

				this._handleIdDepracation(content);
				
				if (fs.existsSync(contentFilePath)) {
					strings[key] = startMarker + fs.readFileSync(contentFilePath) + endMarker;
				} else {
					console.error(('ember-index addon: Cannot find ' + contentFilePath).red);
				}
			}.bind(this));
		}

		if (/^ember-index/.test(type)) {
			if (type === 'ember-index') {
				contentKey = 'default';
			} else {
				contentKey = type.substring('ember-index-'.length, type.length);
			}
		}
		return strings[contentKey] || '';
	},

	included: function(app) {
		this._super.included.apply(this, arguments);
		this.options = assign({}, this._defaultOptions, (app.options['ember-index'] || this.app.project.config(app.env)['ember-index'] || {}));

		this.options.content = util.isArray(this.options.content) ? this.options.content : (this.options.content ? [assign({
			key: 'default'
		}, this.options.content)] : []);

		this.validateOptions();
	},

	postprocessTree: function(type, tree) {
		var returnedTree = tree,
			renamedIndexTree,
			indexTree,
			indexFiles = ['index.html'];

		if (this.app.env !== 'production'){
			indexFiles.push('tests/index.html');
		}

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
				files: indexFiles,
				destDir: '.'
			});

			this.options.content.forEach(function(content) {
				var key = content.key || content.id;
				var startMarker = this._getStartMarker(key);
				var endMarker = this._getEndMarker(key);
				var markersRegExp = new RegExp('(' + startMarker + '|' + endMarker + ')', 'g');
				var injectedContentRegExp = new RegExp(startMarker + '([\\s\\S])*' + endMarker, 'g');

				this._handleIdDepracation(content);

				renamedIndexTree = replaceString(renamedIndexTree, {
					files: [this.options.output],
					pattern: {
						match: content.includeInOutput ? markersRegExp : injectedContentRegExp,
						replacement: ''
					}
				});

				indexTree = replaceString(indexTree, {
					files: indexFiles,
					pattern: {
						match: content.includeInIndexHtml ? markersRegExp : injectedContentRegExp,
						replacement: ''
					}
				});

			}, this);

			returnedTree = mergeTrees([tree, renamedIndexTree, indexTree], {
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

	_getStartMarker: function(key) {
		return this._startMarkerPrefix + '-' + key;
	},

	_getEndMarker: function(key) {
		return this._endMarkerPrefix + '-' + key;
	},

	_handleIdDepracation: function(content){
		deprecate('ember-index: "id" property is depracated when defining multiple content entries. Please use "key" instead.', !!content.id && !this._didShowIdDeprecationWarning);
		if (!this._didShowIdDeprecationWarning && !!content.id){
			this._didShowIdDeprecationWarning = true;	
		}
	},

	_didShowIdDeprecationWarning: false

};