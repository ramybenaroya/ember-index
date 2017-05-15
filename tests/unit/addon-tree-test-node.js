/*jshint -W079 */
/* jshint node: true */
var expect = require('chai').expect;
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var broccoli = require('broccoli');
var path = require('path');
var fs = require('fs');

//var path = require('path');
function getEmberIndexAddon(options) {
    var dummyApp = new EmberAddon(options);
    return findEmberIndex(dummyApp);
}

function findEmberIndex(app) {
    var addons = app.project.addons;
    for (var i = 0; i < addons.length; i++) {
        if (addons[i].name === 'ember-index') {
            return addons[i];
        }
    }
}

describe('Addon', function() {
    var builder;

    this.timeout(15000);

    afterEach(function() {
        if (builder) {
            return builder.cleanup();
        }
    });

    describe('#contentFor', function() {
        var contentFor;
        var addon;

        it('returns proper content for a single "content-for" tag', function() {
            addon = getEmberIndexAddon({
                'ember-index': {
                    content: {
                        file: '_emberIndexContent/file1.txt',
                        includeInOutput: false,
                        includeInIndexHtml: true
                    }
                }
            });
            contentFor = addon.contentFor('ember-index');

            expect(contentFor).to.be.equal(addon._startMarkerPrefix + '-default' + '<!-- content from file1 -->' + addon._endMarkerPrefix + '-default');
        });

        it('returns proper content for multiple "content-for" tags', function() {
            addon = getEmberIndexAddon({
                'ember-index': {
                    content: [{
                        key: '1',
                        file: '_emberIndexContent/file1.txt',
                        includeInOutput: false,
                        includeInIndexHtml: true
                    }, {
                        key: '2',
                        file: '_emberIndexContent/file2.txt',
                        includeInOutput: false,
                        includeInIndexHtml: true
                    }, {
                        key: '3',
                        file: '_emberIndexContent/file3.txt',
                        includeInOutput: false,
                        includeInIndexHtml: true
                    }]
                }
            });

            contentFor = addon.contentFor('ember-index-1');

            expect(contentFor).to.be.equal(addon._startMarkerPrefix + '-1' + '<!-- content from file1 -->' + addon._endMarkerPrefix + '-1');

            contentFor = addon.contentFor('ember-index-2');

            expect(contentFor).to.be.equal(addon._startMarkerPrefix + '-2' + '<!-- content from file2 -->' + addon._endMarkerPrefix + '-2');

            contentFor = addon.contentFor('ember-index-3');

            expect(contentFor).to.be.equal(addon._startMarkerPrefix + '-3' + '<!-- content from file3 -->' + addon._endMarkerPrefix + '-3');
        });
    });


    describe('#appTree', function() {
        var appTree;
        var dummyVar;

        it('creates a simple clone of index.html', function() {
            appTree = new EmberAddon({
                'ember-index': {
                    output: 'index.jsp'
                }
            }).toTree();

            builder = new broccoli.Builder(appTree);
            return builder.build()
                .then(function(results) {
                    var indexHtml, indexJsp,
                        outputPath = results.directory,
                        indexJspPath = path.join(outputPath, 'index.jsp'),
                        indexHtmlPath = path.join(outputPath, 'index.html');

                    expect(fs.existsSync(indexJspPath)).to.be.equal(true);

                    indexJsp = fs.readFileSync(indexJspPath).toString();
                    indexHtml = fs.readFileSync(indexHtmlPath).toString();

                    dummyVar = expect(indexJsp).not.to.be.empty;

                    expect(indexHtml).to.be.equal(indexJsp);
                });
        });

        it('ember-index is disabled when enabled=false', function() {
            appTree = new EmberAddon({
                'ember-index': {
                    output: 'index.jsp',
                    enabled: false
                }
            }).toTree();

            builder = new broccoli.Builder(appTree);
            return builder.build()
                .then(function(results) {
                    var outputPath = results.directory,
                        indexJspPath = path.join(outputPath, 'index.jsp');

                    expect(fs.existsSync(indexJspPath)).to.be.equal(false);
                });
        });

        it('Insert content according to "includeInOutput" & "includeInIndexHtml"', function() {
            appTree = new EmberAddon({
                'ember-index': {
                    output: 'index.jsp',
                    content: [{
                        key: '1',
                        file: '_emberIndexContent/file1.txt',
                        includeInOutput: false,
                        includeInIndexHtml: false
                    }, {
                        key: '2',
                        file: '_emberIndexContent/file2.txt',
                        includeInOutput: true,
                        includeInIndexHtml: false
                    }, {
                        key: '3',
                        file: '_emberIndexContent/file3.txt',
                        includeInOutput: false,
                        includeInIndexHtml: true
                    },{
                        key: '4',
                        file: '_emberIndexContent/file4.txt',
                        includeInOutput: true,
                        includeInIndexHtml: true
                    }]
                }
            }).toTree();

            builder = new broccoli.Builder(appTree);
            return builder.build()
                .then(function(results) {
                    var indexHtml, indexJsp,
                        outputPath = results.directory,
                        indexJspPath = path.join(outputPath, 'index.jsp'),
                        indexHtmlPath = path.join(outputPath, 'index.html'),
                        file1RegExp = /<!-- content from file1 -->/,
                        file2RegExp = /<!-- content from file2 -->/,
                        file3RegExp = /<!-- content from file3 -->/,
                        file4RegExp = /<!-- content from file4 -->/;

                        expect(fs.existsSync(indexJspPath)).to.be.equal(true);

                    indexJsp = fs.readFileSync(indexJspPath).toString();
                    indexHtml = fs.readFileSync(indexHtmlPath).toString();

                    expect(file1RegExp.test(indexJsp)).to.be.equal(false);

                    expect(file1RegExp.test(indexHtml)).to.be.equal(false);

                    expect(file2RegExp.test(indexJsp)).to.be.equal(true);

                    expect(file2RegExp.test(indexHtml)).to.be.equal(false);

                    expect(file3RegExp.test(indexJsp)).to.be.equal(false);

                    expect(file3RegExp.test(indexHtml)).to.be.equal(true);

                    expect(file4RegExp.test(indexJsp)).to.be.equal(true);

                    expect(file4RegExp.test(indexHtml)).to.be.equal(true);


                });
        });

        it('Use the destDir option correctly.', function() {
          appTree = new EmberAddon({
            'ember-index': {
              destDir: 'export',
              output: 'index.jsp',
              content: [{
                key: '1',
                file: '_emberIndexContent/file1.txt',
                includeInOutput: false,
                includeInIndexHtml: false
              }, {
                key: '2',
                file: '_emberIndexContent/file2.txt',
                includeInOutput: true,
                includeInIndexHtml: false
              }]
            }
          }).toTree();

          builder = new broccoli.Builder(appTree);
          return builder.build()
            .then(function(results) {
              var outputPath = results.directory;
              var indexJspPath = path.join(outputPath, 'export/index.jsp');

              expect(fs.existsSync(indexJspPath)).to.be.equal(true);

            });
        });
      });
});
