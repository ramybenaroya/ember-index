/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');
var renameFiles = require('broccoli-rename-files');
var assign = require('object-assign');
var mergeTrees = require('broccoli-merge-trees');
var funnel = require('broccoli-funnel');
var removeFiles = require('broccoli-file-remover');
var colors = require('colors');
var MARKER = '<!--injected-by-ember-index-addon-->'


module.exports = {
	name: 'ember-index',
	defaultOptions: {
		enabled: true,
		contentFilename: 'file.txt',
		outputFilename: 'index.jsp'
	},

	contentFor: function(type, config) {
		if (type === 'ember-index'){
			return this._contentToInject;	
		}
	},

	included: function(app) {
		var auxTree, contentFilePath;

		this._super.included.apply(this, arguments);
		this.options = assign({}, this.defaultOptions, (app.options['ember-index'] || {}));
		if (this.options.enabled && this.options.contentFilename) {
			auxTree = funnel(app.options.trees.app, {
				srcDir: '.',
				files: [this.options.contentFilename],
				destDir: '.'
			});

			contentFilePath = path.join(auxTree.inputTree, this.options.contentFilename);
			if (fs.existsSync(contentFilePath)) {
				this._contentToInject = MARKER + '\n' + fs.readFileSync(contentFilePath) + '\n' + MARKER;
			} else {
				console.error(('ember-index addon: Cannot find ' + contentFilePath).red);
			}
		}
	},

	postprocessTree: function(type, tree) {
		var returnedTree = tree,
			auxTree;

		if (this.options.enabled && this.options.outputFilename && type === 'all') {

			auxTree = funnel(tree, {
				srcDir: '.',
				files: ['index.html'],
				destDir: '.'
			});
			auxTree = renameFiles(auxTree, {
				transformFilename: function() {
					return this.options.outputFilename;
				}.bind(this)
			});

			returnedTree = mergeTrees([tree, auxTree]);
		}

		return returnedTree;
	}
};