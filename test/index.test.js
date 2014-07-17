/**!
 * koa-safe-jsonp - test/index.test.js
 *
 * Copyright(c) 2014 fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var should = require('should');
var koa = require('koa');
var request = require('supertest');
var jsonp = require('../');

describe('index.test.js', function () {
  it('should send jsonp response without padding when callback missing', function (done) {
    var app = koa();
    jsonp(app);
    app.use(function* () {
      this.body = this.jsonp({foo: 'bar'});
    });

    request(app.listen())
    .get('/foo.json?foo=fn')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('{"foo":"bar"}')
    .expect(200, done);
  });

  it('should send jsonp response with default callback', function (done) {
    var app = koa();
    jsonp(app);
    app.use(function* () {
      this.body = this.jsonp({foo: 'bar'});
    });

    request(app.listen())
    .get('/foo.json?callback=fn')
    .expect('Content-Type', 'application/javascript')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});')
    .expect(200, done);
  });

  it('should send jsonp response with custom callback', function (done) {
    var app = koa();
    jsonp(app, {
      callback: '_callback'
    });
    app.use(function* () {
      this.body = this.jsonp({foo: 'bar'});
    });

    request(app.listen())
    .get('/foo.json?_callback=$jsonp_callback')
    .expect('Content-Type', 'application/javascript')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof $jsonp_callback === \'function\' && $jsonp_callback({"foo":"bar"});')
    .expect(200, done);
  });
});
