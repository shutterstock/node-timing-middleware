module.exports = function(logger) {
  return function(req, res, next) {
    if (req._timingMiddleware) {
      return next();
    }

    req._timingMiddleware = true;

    var origWriteHead = res.writeHead;
    var start = Date.now();

    res.writeHead = function() {
      var key = (req.route || {}).path;
      var duration = Date.now() - start;

      logger(req.method, key, duration);

      origWriteHead.apply(res, arguments);
    };

    next();
  };
};
