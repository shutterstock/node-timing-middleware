# node-timing-middleware

Expose request times to do with as you desire: statsd, log, etc.

[![Build Status](https://secure.travis-ci.org/shutterstock/node-timing-middleware.png)](http://travis-ci.org/shutterstock/node-timing-middleware)

## Caveats

Works with any express 2+, but express versions 4+ will not return a correct path if:

  * routes are nested
  * middleware responds to a request rather than a route handler

## Example usage

```javascript

var timing  = require('timing-middleware');
var express = require('express');

var app = express();

app.use(timing(function(verb, path, duration, req, res) {
  console.log(verb, path, "took", duration, "ms and returned ", res.statusCode);
}));

app.get('/fairly_slow_route', function(req, res, next) {
  setTimeout(function() {
    res.send('ok!\n');
  }, 10);
});
```
