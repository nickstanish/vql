var chai = require("chai");
var assert = chai.assert;

var Tokenizer = require("../src/tokenizer");
var Parser = require("../src/parser");
var interpreterLib = require("../src/interpreter");
var Interpreter = interpreterLib.Interpreter;
var Context = interpreterLib.Context;

describe('Identifiers', function () {
  var tokenizer = new Tokenizer();
  var parser = new Parser();
  var interpreter = new Interpreter();

  var context = new Context();
  context.set("x", 5);
  context.set("y", 2);
  context.set("myString", "hey");
  context.set("z", {a: 8, b: {c: 6}});

  var tests = [
    { description: "finds simple number identifier", input: "x", expected: 5 },
    { description: "finds simple string identifier", input: "myString", expected: "hey" },
    { description: "add identifiers", input: "x + y", expected: 7 },
    { description: "finds sub-identifier", input: "z.a", expected: 8 },
    { description: "adds sub-identifier to float", input: "6.0 + z.a", expected: 14 },
    { description: "finds sub-sub-identifier", input: "z.b.c", expected: 6 },
    { description: "adds sub-sub-identifier to sub-identifier", input: "z.b.c + z.a", expected: 14 },
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
