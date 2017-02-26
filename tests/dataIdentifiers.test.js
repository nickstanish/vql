var chai = require("chai");
var assert = chai.assert;

var Tokenizer = require("../src/tokenizer");
var Parser = require("../src/parser");
var interpreterLib = require("../src/interpreter");
var Interpreter = interpreterLib.Interpreter;
var Context = interpreterLib.Context;

describe('Data Identifiers', function () {
  var tokenizer = new Tokenizer();
  var parser = new Parser();
  var interpreter = new Interpreter();
  var context = new Context({
    "name with spaces": {
      a: 2
    },
    x: 5,
    sources: [{
      b: 1,
      c: 4
    }]
  });
  context.set("x", 3);

  var tests = [
    { description: "finds simple number data identifier", input: "$x", expected: 5 },
    { description: "finds simple array item in data identifier", input: "$sources[0].b", expected: 1 },
    { description: "add identifier to data identifer", input: "$x + x", expected: 8 },
    { description: "finds quoted names", input: "$'name with spaces'.a", expected: 2 }
  ];

  tests.forEach(function (test) {
    it(test.description, function () {
      var tokens = tokenizer.tokenize(test.input);
      var audit = parser.auditTokens(tokens);
      var parseTree = parser.parse(audit.keptTokens);
      var result = interpreter.evaluate(parseTree.statements, context);
      assert.equal(result, test.expected);
    });
  });
});
