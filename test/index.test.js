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
var qs = require('koa-qs');
var request = require('supertest');
var jsonp = require('../');

describe('index.test.js', function () {
  it('should send normal response when callback missing', function (done) {
    var app = koa();
    jsonp(app);
    app.use(function* () {
      this.jsonp = {foo: 'bar'};
    });

    request(app.listen())
    .get('/foo.json?foo=fn')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect('{"foo":"bar"}')
    .expect(200, done);
  });

  it('should send normal response when callback is empty string', function (done) {
    var app = koa();
    jsonp(app);
    app.use(function* () {
      this.jsonp = {foo: 'bar'};
    });

    request(app.listen())
    .get('/foo.json?foo=fn&callback=')
    .expect('Content-Type', 'application/json; charset=utf-8')
    .expect('{"foo":"bar"}')
    .expect(200, done);
  });

  it('should send jsonp response with default callback', function (done) {
    var app = koa();
    jsonp(app);
    app.use(function* () {
      this.jsonp = {foo: 'bar'};
    });

    request(app.listen())
    .get('/foo.json?callback=fn')
    .expect('Content-Type', 'application/javascript; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});')
    .expect(200, done);
  });

  it('should send jsonp response with array callback', function (done) {
    var app = koa();
    qs(app);
    jsonp(app);
    app.use(function* () {
      this.jsonp = {foo: 'bar'};
    });

    request(app.listen())
    .get('/foo.json?callback=fn&callback=cb')
    .expect('Content-Type', 'application/javascript; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof fn === \'function\' && fn({"foo":"bar"});')
    .expect(200, done);
  });

  it('should send number response', function (done) {
    var app = koa();
    jsonp(app);
    app.use(function* () {
      this.jsonp = 1984;
    });

    request(app.listen())
    .get('/foo.json?callback=fn')
    .expect('Content-Type', 'application/javascript; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof fn === \'function\' && fn(1984);')
    .expect(200, done);
  });

  it('should send string response', function (done) {
    var app = koa();
    jsonp(app);
    app.use(function* () {
      this.jsonp = '1984';
    });

    request(app.listen())
    .get('/foo.json?callback=fn')
    .expect('Content-Type', 'application/javascript; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof fn === \'function\' && fn("1984");')
    .expect(200, done);
  });

  it('should send jsonp response with custom callback', function (done) {
    var app = koa();
    jsonp(app, {
      callback: '_callback'
    });
    app.use(function* () {
      this.jsonp = {foo: 'bar'};
    });

    request(app.listen())
    .get('/foo.json?_callback=$jsonp_callback')
    .expect('Content-Type', 'application/javascript; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof $jsonp_callback === \'function\' && $jsonp_callback({"foo":"bar"});')
    .expect(200, done);
  });

  it('should limit callback name length to 10', function (done) {
    var app = koa();
    jsonp(app, {
      callback: '_callback',
      limit: 10
    });
    app.use(function* () {
      this.jsonp = {foo: 'bar'};
    });

    request(app.listen())
    .get('/foo.json?_callback=$123456789jsonp_callbackjsonp_callbackjsonp_callback')
    .expect('Content-Type', 'application/javascript; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof $123456789 === \'function\' && $123456789({"foo":"bar"});')
    .expect(200, done);
  });

  it('should dont limit when callback name length < limit options', function (done) {
    var app = koa();
    jsonp(app, {
      callback: '_callback',
      limit: 10
    });
    app.use(function* () {
      this.jsonp = {foo: 'bar'};
    });

    request(app.listen())
    .get('/foo.json?_callback=$123')
    .expect('Content-Type', 'application/javascript; charset=utf-8')
    .expect('X-Content-Type-Options', 'nosniff')
    .expect('/**/ typeof $123 === \'function\' && $123({"foo":"bar"});')
    .expect(200, done);
  });
});
