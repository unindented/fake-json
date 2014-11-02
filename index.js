'use strict';

var _       = require('lodash');
var Faker   = require('faker');
var RandExp = require('randexp');

// Utilities

var construct = function (constructor, args) {
  var F = function () {
    return constructor.apply(this, args);
  };
  F.prototype = constructor.prototype;

  return new F();
};

var namespace = function (root, ns) {
  _.each(ns.split('.'), function (part) {
    if (_.isUndefined(root[part])) {
      root[part] = {};
    }
    root = root[part];
  });

  return root;
};

// Exports

var FakeJson = function (schema) {
  this.schema  = schema;
  this.classes = {};
};

FakeJson.prototype.registerClasses = function (classes) {
  _.extend(this.classes, classes);
};

FakeJson.prototype.generate = function (schema, depth) {
  schema = schema || this.schema;
  depth  = depth || 0;

  if (!_.isObject(schema)) {
    return schema;
  }

  if (_.isArray(schema.enum)) {
    return this.enum(schema, depth);
  }

  switch (schema.type) {
    case 'array':
    case 'boolean':
    case 'integer':
    case 'number':
    case 'null':
    case 'object':
    case 'string':
      return this[schema.type](schema, depth);
    default:
      throw 'Unknown type: ' + schema.type;
  }
};

FakeJson.prototype['array'] = function (schema, depth) {
  depth = depth || 0;

  if (_.isArray(schema.items)) {
    return _.map(schema.items, function (item) {
      return this.generate(item, depth + 1);
    }, this);
  }
  else if (_.isObject(schema.items)) {
    var min = schema.minItems;
    var max = schema.maxItems;

    var range = _.range(this.number({
      minimum: (min != null ? min : 1),
      maximum: (max != null ? max : 10)
    }));

    return _.map(range, function () {
      return this.generate(schema.items, depth + 1);
    }, this);
  }

  return [];
};

FakeJson.prototype['boolean'] = function () {
  return namespace(Faker, 'random.array_element')([true, false]);
};

FakeJson.prototype['enum'] = function (schema, depth) {
  depth = depth || 0;

  var index = this.number({
    minimum: 1,
    maximum: schema.enum.length
  });

  var value = schema.enum[index - 1];
  return this.generate(value, depth + 1);
};

FakeJson.prototype['integer'] = function (schema) {
  return this.number(schema);
};

FakeJson.prototype['number'] = function (schema) {
  var min = schema.minimum;
  var max = schema.maximum;
  var xmin = schema.exclusiveMinimum;
  var xmax = schema.exclusiveMaximum;

  return namespace(Faker, 'random.number')({
    min: (min != null ? min : 1)  + (xmin ? 1 : 0),
    max: (max != null ? max : 10) - (xmax ? 1 : 0)
  });
};

FakeJson.prototype['null'] = function () {
  return null;
};

FakeJson.prototype['object'] = function (schema, depth) {
  depth = depth || 0;

  var args = [];
  var obj  = {};

  if (schema.class) {
    args = this.array({items: schema.arguments});
    obj  = construct(this.classes[schema.class], args);
  }

  return _.reduce(schema.properties, function (memo, prop, key) {
    memo[key] = this.generate(prop, depth + 1);
    return memo;
  }, obj, this);
};

FakeJson.prototype['string'] = function (schema) {
  if (schema.pattern) {
    return new RandExp(schema.pattern).gen();
  }

  if (schema.faker) {
    return namespace(Faker, schema.faker)();
  }

  var min = schema.minLength;
  var max = schema.maxLength;
  var str = namespace(Faker, 'lorem.words')(min).join(' ');

  return str.substr(0, (max != null ? max : str.length));
};

module.exports = FakeJson;
