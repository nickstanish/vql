var chai = require("chai");
var assert = chai.assert;

var Tokenizer = require("../src/tokenizer");
var Parser = require("../src/parser");
var interpreterLib = require("../src/interpreter");
var Interpreter = interpreterLib.Interpreter;
var Context = interpreterLib.Context;

describe('Math Computation', function () {
  var tokenizer = new Tokenizer();
  var parser = new Parser();
  var interpreter = new Interpreter();

  var context = new Context();
  var tests = [
    { input: "1 + 1", expected: 2 },
    { input: "2.0 + 9.8", expected: 11.8 },
    { input: "6 / 2", expected: 3 },
    { input: "(1 + 1) / 2", expected: 1 },
    { input: "12 / (2 * 6)", expected: 1 },
    { input: "0 * 9 + 1 / (1 - 2)", expected: -1 },
    { input: "-5", expected: -5 },
    { input: "-1 + 2", expected: 1 },
    { input: "-(1 + 2) - 2.0", expected: -5 },
    { input: "-1", expected: -1 }

  ];

  tests.forEach(function (test) {
    it('correctly computes "' + test.input + '"', function () {
      var tokens = tokenizer.tokenize(test.input);
      var audit = parser.auditTokens(tokens);
      var parseTree = parser.parse(audit.keptTokens);
      var result = interpreter.evaluate(parseTree.statements, context);
      assert.equal(result, test.expected);
    });
  });


});
