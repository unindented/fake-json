'use strict';

var fs       = require('fs');
var path     = require('path');
var tv4      = require('tv4');
var FakeJson = require('../index.js');

var base      = path.join(__dirname, 'schemas');
var schemas   = fs.readdirSync(base);
var generator = new FakeJson();

generator.registerClasses({
  'Custom': function (l, v) {
    this.label = l;
    this.value = v;
  }
});

var run = function (memo, file) {
  var schema = require(path.join(base, file));
  var data   = generator.generate(schema);
  var name   = file.replace(/_/g, ' ').replace(/\.[^.]+$/, '');

  console.log(name, '=>', data);

  memo[name] = function (test) {
    test.ok(tv4.validate(data, schema, true));
    test.done();
  };

  return memo;
};

module.exports.test = schemas.reduce(run, {
  'same schema': function (test) {
    var schema = {type: 'array'};
    var fake   = new FakeJson(schema);
    var data   = fake.generate();

    test.ok(tv4.validate(data, schema));
    test.done();
  },

  'different schemas': function (test) {
    var fake    = new FakeJson();
    var schema1 = {type: 'array'};
    var data1   = generator.generate(schema1);
    var schema2 = {type: 'string'};
    var data2   = fake.generate(schema2);

    test.ok(tv4.validate(data1, schema1));
    test.ok(tv4.validate(data2, schema2));
    test.done();
  }
});
