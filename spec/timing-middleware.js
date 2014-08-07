'use strict';

var chai    = require('chai');
var expect  = chai.expect;
var subject = require('../');
var express = require('express');
var request = require('supertest');

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
      app = express();

      app.use(subject(function(verb, path, time) {
        result.verb = verb;
        result.path = path;
        result.time = time;
      }));

      app.get('/test/:with_param', function(req, res, next) {
        setTimeout(function() {
          res.send('doesntmatter');
        }, 10);
      });

      app.get('/bad_route', function(req, res, next) {
        throw new Error('Dont you hate it when this happens?');
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
    });
  });
});

