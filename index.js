function getPathForRequest(req) {
  var path   = (req.route || {}).path;
  var method = req.method.toLowerCase();
  var routes;

  if (!path) {
    if (req.app && req.app.routes) {
      if (req.app.routes[method]) {
        // express 3
        routes = req.app.routes[method] || [];
      } else {
        // express 2
        routes = req.app.routes.routes[method] || [];
      }

      for (var i = 0, l = routes.length; i < l; ++i) {
        if (routes[i].regexp.test(req.path)) {
          return routes[i].path;
        }
      }
    } else {
      // express 4 would require a recursive function to build up a string
    }
  }

  path = path || 'unknown';
  return path;
}

module.exports = function(logger) {
  return function(req, res, next) {
    if (req._timingMiddleware) {
      return next();
    }

    req._timingMiddleware = true;

    var origWriteHead = res.writeHead;
    var start = Date.now();

    res.writeHead = function() {
      var path = getPathForRequest(req);
      var duration = Date.now() - start;

      logger(req.method, path, duration, req, res);

      origWriteHead.apply(res, arguments);
    };

    next();
  };
};
