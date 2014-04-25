# node-timing-middleware

[![Build Status](https://secure.travis-ci.org/shutterstock/node-timing-middleware.png)](http://travis-ci.org/shutterstock/node-timing-middleware)

## Example usage

```javascript

var timing  = require('timing-middleware');
var express = require('express');

var app = express();

app.use(timing(function(path, duration) {
  console.log("PATH " + path + " TOOK " + duration + "ms");
}));

app.get('/fairly_slow_route', function(req, res, next) {
  setTimeout(function() {
    res.send('ok!\n');
  }, 10);
});
```
