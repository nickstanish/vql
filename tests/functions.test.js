var chai = require("chai");
var assert = chai.assert;

var Tokenizer = require("../src/tokenizer");
var Parser = require("../src/parser");
var interpreterLib = require("../src/interpreter");
var Interpreter = interpreterLib.Interpreter;
var Context = interpreterLib.Context;

describe('Functions', function () {
  var tokenizer = new Tokenizer();
  var parser = new Parser();
  var interpreter = new Interpreter();

  describe('Function Calls', function () {
    var context = new Context();
    context.set("a", function () {
      return 5;
    });
    context.set("y", 2);
    context.set("addThree", function (param1, param2, param3) {
      return param1 + param2 + param3;
    });
    context.set("z", {a: 8, b: {c: 6}});

    var tests = [
      { description: "correctly calls no-arg function", input: "a()", expected: 5 },
      { description: "correctly calls 3-arg function", input: "addThree(1,2,3)", expected: 6 },
      { description: "correctly adds result of function to number", input: "3 + addThree(1,2,3)", expected: 9 },
      { description: "correctly adds number to result of function", input: "addThree(1,2,3) + 3", expected: 9 },
      { description: "correctly computes expression inside function", input: "addThree(1+2+3,0,3)", expected: 9 },
      { description: "correctly computes function inside function", input: "addThree(1+a()+3,0,3)", expected: 12 },
      { description: "correctly computes parentheses inside function", input: "addThree(2+(a()+1)+6/2,0,1)", expected: 12 }
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

});
