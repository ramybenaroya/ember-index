# Ember-index 

[![npm version](https://badge.fury.io/js/ember-index.svg)](http://badge.fury.io/js/ember-index)
[![Build Status](https://travis-ci.org/ramybenaroya/ember-index.svg?branch=master)](https://travis-ci.org/ramybenaroya/ember-index) 
[![Ember Observer Score](http://emberobserver.com/badges/ember-index.svg)](http://emberobserver.com/addons/ember-index) 

Ember addon for manipulating index.html

## Why use it?
Ember cli is doing a great job at generating static assets including `index.html`.
But sometimes you wish to generate an enhanced index file which is actually a server-page (JSP, PHP etc.).  
In order to that, you will need to include specific code blocks in the generated server-page, which won't  be included in the generated index.html (and vice versa).  
This simple addon is meant for doing exactly this.

## [Project's Wiki](https://github.com/ramybenaroya/ember-index/wiki)

## Installation

* `npm i ember-index --save-dev`


##Usage

The following code:
```javascript
// Brocfile.js
var EmberAddon = require('ember-cli/lib/broccoli/ember-app');
var app = new EmberApp({
    'ember-index': {
        output: 'index.jsp'
        content: [{
            id: '1'
            file: 'example1.txt',
            includeInIndexHtml: true,
            includeInOutput: false
        },{
            id: '2'
            file: 'example2.txt',
            includeInIndexHtml: false
            includeInOutput: true
            
        }]
    }
});
module.exports = app.toTree();
```
```
// app/example1.txt
<meta content="Example 1">
```
```
// app/example2.txt
<meta content="Example 2">
```
```html
<!-- app/index.html -->
<!DOCTYPE html>
<html>
  <head>
     ...
     {{content-for 'ember-index-1'}}
     {{content-for 'ember-index-2'}}
  </head>
  <body>
      ...
  </body>
</html>
```
Will result
```html
<!-- dist/index.html -->

<!DOCTYPE html>
<html>
  <head>
    <meta content="Example 1">
    ...
  </head>
  <body>
    ...
  </body>
</html>
```
```html
<!-- dist/index.jsp -->
<!DOCTYPE html>
<html>
  <head>
    <meta content="Example 2">
    ...
  </head>
  <body>
    ...
  </body>
</html>
```

## Tests
`npm run test`

## License
MIT
