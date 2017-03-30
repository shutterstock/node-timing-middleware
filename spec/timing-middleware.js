'use strict';

var chai    = require('chai');
var expect  = chai.expect;
var subject = require('../');
var express = require('express');
var request = require('supertest');

chai.config.includeStack = true;

describe("timing-middleware", function() {
  it("exports a function", function(done) {
    expect(subject).to.be.a('function');
    done();
  });

  context("when used by an express app", function() {
    var result;
    var app;

    beforeEach(function() {
      result = {
        fake: 'timing recorder'
      };

      if ('function' == typeof express) {
        // express 3+
        app = express();
      } else {
        // express 2
        app = express.createServer();
      }

      app.use(subject(function(verb, path, time, req, res) {
        result.verb = verb;
        result.path = path;
        result.time = time;
        result.req  = req;
        result.res  = res;
      }));

      app.use(function(req, res, next) {
        if (req.path.match(/auth_failure$/)) {
          res.statusCode = 400;
          return res.send('auth failure');
        }

        next();
      });

      app.get('/test/:with_param', function(req, res, next) {
        setTimeout(function() {
          res.send('doesntmatter');
        }, 10);
      });

      app.get('/bad_route', function(req, res, next) {
        throw new Error('Example failing request');
      });

      app.use(function(err, req, res, next) {
        res.statusCode = 500;
        res.send(err);
      });
    });

    context('When used with options', function() {
      it('does not cause an error and tracks the amount of time it takes', function(done) {
        request(app)
          .options('/test/1')
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;

            expect(res.body).to.deep.equal({});
            expect(res.headers.allow).to.equal('GET,HEAD');

            expect(result.verb).to.equal('OPTIONS');
            expect(result.path).to.equal('unknown');
            expect(result.time).to.be.a('Number');
            expect(result.time).to.be.above(-1);

            done();
          });
      });
    });

    context("when the route does not error", function() {
      it("tracks the amount of time that a request takes", function(done) {
        request(app)
          .get('/test/1')
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.equal('doesntmatter');
            expect(result.verb).to.equal('GET');
            expect(result.path).to.equal('/test/:with_param');
            expect(result.time).to.be.a('Number');
            expect(result.time).to.be.above(4);

            done();
          });
      });

      it("returns the related req/res", function(done) {
        request(app)
          .get('/test/1')
          .expect(200)
          .end(function(err, res) {
            expect(err).to.not.exist;

            expect(result.req).to.exist;
            expect(result.req.method).to.equal('GET');

            expect(result.res).to.exist;
            expect(result.res.send).to.be.a('function');

            done();
          });
      });
    });

    context("when the route errors", function() {
      it("tracks the amount of time that a request takes", function(done) {
        request(app)
          .get('/bad_route')
          .expect(500)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(result.verb).to.equal('GET');
            expect(result.path).to.equal('/bad_route');
            expect(result.time).to.be.a('Number');

            done();
          });
      });

      it("returns the related req/res", function(done) {
        request(app)
          .get('/bad_route')
          .expect(500)
          .end(function(err, res) {
            expect(err).to.not.exist;

            expect(result.req).to.exist;
            expect(result.req.method).to.equal('GET');

            expect(result.res).to.exist;
            expect(result.res.send).to.be.a('function');

            done();
          });
      });
    });

    context("when middleware responds before a route handler", function() {
      it("populates the path with a matching route handler", function(done) {
        request(app)
          .get('/test/auth_failure')
          .expect(400)
          .end(function(err, res) {
            expect(err).to.not.exist;
            expect(res.text).to.equal('auth failure');

            expect(result.verb).to.equal('GET');

            if ('4' === process.env.express_version) {
              expect(result.path).to.equal('unknown');
            } else {
              expect(result.path).to.equal('/test/:with_param');
            }

            expect(result.time).to.be.a('Number');

            done();
          });

      });
    });
  });
});

