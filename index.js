/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');

var mergeTrees = require('broccoli-merge-trees');
var funnel = require('broccoli-funnel');
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
				var rootPath = this.app.project.root;
				var appPath = this.app.options.trees.app;
				var	contentFilePath;

				if (appPath && typeof appPath.__broccoliGetInfo__ === 'function') {
					appPath = appPath.__broccoliGetInfo__();
					appPath = appPath && appPath.sourceDirectory
				}

				if (typeof appPath !== 'string') {
					appPath = 'app';
				}
				
				if(content.file) {
					if (new RegExp('^' + rootPath).test(appPath) || (appPath.indexOf(':\\') !== -1 && appPath.indexOf(appPath) === 0)){
						contentFilePath = path.join(appPath, content.file);
					} else {
						contentFilePath = path.join(rootPath, appPath, content.file);
					}
				}				

				this._handleIdDepracation(content);

				if (content.file && fs.existsSync(contentFilePath)) {
					strings[key] = startMarker + fs.readFileSync(contentFilePath) + endMarker;
				} else if(content.string && typeof content.string === 'string') {
					strings[key] = startMarker + content.string + endMarker;
				} else {
					if(content.file) {
						console.error(('ember-index addon: Cannot find ' + contentFilePath).red);						
					} else {
						console.error(('ember-index addon: No "file" or "string" property set for this item').red);	
					}
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
			treesToMerge = [],
			indexFiles = ['index.html'];

		if (this.app.tests) {
			indexFiles.push('tests/index.html');
		}

		if (this.options.enabled && type === 'all') {
			if (this.options.output) {
				renamedIndexTree = funnel(tree, {
					srcDir: '.',
					files: ['index.html'],
					destDir: this.options.destDir || '.',
					getDestinationPath: function() {
							return this.options.output;
					}.bind(this)
				});
			}

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

				if (this.options.output && renamedIndexTree) {
          var file = this.options.destDir ? [this.options.destDir + '/' + this.options.output] : [this.options.output];

          renamedIndexTree = replaceString(renamedIndexTree, {
						files: file,
						pattern: {
							match: content.includeInOutput ? markersRegExp : injectedContentRegExp,
							replacement: ''
						}
					});
				}

				indexTree = replaceString(indexTree, {
					files: indexFiles,
					pattern: {
						match: content.includeInIndexHtml ? markersRegExp : injectedContentRegExp,
						replacement: ''
					}
				});

			}, this);

			treesToMerge.push(tree);
			if (this.options.output && renamedIndexTree) {
				treesToMerge.push(renamedIndexTree)
			}
			treesToMerge.push(indexTree);

			returnedTree = mergeTrees(treesToMerge, {
				overwrite: true
			});
		}

		return returnedTree;
	},

	validateOptions: function() {
    if (this.options.output === 'index.html' && (!this.options.destDir || this.options.destDir === '.')) {
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
