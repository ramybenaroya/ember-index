# Ember-index [![Build Status](https://travis-ci.org/ramybenaroya/ember-index.svg?branch=master)](https://travis-ci.org/ramybenaroya/ember-index)

Ember addon for manipulating index.html

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
        content: {
            file: 'example.txt',
            includeInOutput: true
            includeInIndexHtml: false
        }
    }
});
module.exports = app.toTree();
```
```
// app/example.txt
<!-- some content from exapmle.txt -->
```
```html
<!-- app/index.html -->
{{content-for 'ember-index'}}

<!DOCTYPE html>
<html>
  <head>
     ....
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
      ...
  </head>
  <body>
      ...
  </body>
</html>
```
```html
<!-- dist/index.jsp -->
<!-- some content from exapmle.txt -->
<!DOCTYPE html>
<html>
  <head>
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
