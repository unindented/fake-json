# Fake JSON [![Version](https://img.shields.io/npm/v/fake-json.svg)](https://www.npmjs.com/package/fake-json) [![Build Status](https://img.shields.io/travis/unindented/fake-json.svg)](http://travis-ci.org/unindented/fake-json) [![Dependency Status](https://img.shields.io/gemnasium/unindented/fake-json.svg)](https://gemnasium.com/unindented/fake-json)

Generate fake data based on a JSON schema.


## Installation

```sh
$ npm install --save fake-json
```


## Usage

If you are going to generate data from the same schema multiple times, do something like this:

```js
var FakeJson = require('fake-json');

var schema = {
  "type": "array",
  "items": {
    "type": "number",
    "minimum": 1,
    "maximum": 10
  },
  "minItems": 2,
  "maxItems": 5
};

var generator = new FakeJson(schema);
generator.generate(); // => [ 6, 10, 7 ]
```

If you are going to generate data from different schemas each time, you can do this instead:

```js
var FakeJson = require('fake-json');
var generator = new FakeJson();

var schema = {
  "type": "array",
  "items": {
    "type": "number",
    "minimum": 1,
    "maximum": 10
  },
  "minItems": 2,
  "maxItems": 5
};

generator.generate(schema); // => [ 8, 1, 7, 5, 7 ]
```


## Meta

* Code: `git clone git://github.com/unindented/fake-json.git`
* Home: <https://github.com/unindented/fake-json/>


## Contributors

* Daniel Perez Alvarez ([unindented@gmail.com](mailto:unindented@gmail.com))


## License

Copyright (c) 2014 Daniel Perez Alvarez ([unindented.org](https://unindented.org/)). This is free software, and may be redistributed under the terms specified in the LICENSE file.
