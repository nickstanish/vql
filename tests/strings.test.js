var chai = require("chai");
var assert = chai.assert;

var Tokenizer = require("../src/tokenizer");
var Parser = require("../src/parser");
var interpreterLib = require("../src/interpreter");
var Interpreter = interpreterLib.Interpreter;
var Context = interpreterLib.Context;

describe('Strings', function () {
  var tokenizer = new Tokenizer();
  var parser = new Parser();
  var interpreter = new Interpreter();


  var tests = [
    {
      input: "\"hi\"",
      expected: 'hi'
    },
    {
      input: "\"hi, how are you?\"",
      expected: "hi, how are you?"
    },
    {
      input: "'hi, how are you?'",
      expected: 'hi, how are you?'
    },
    {
      input: "'\"well..\", he said'",
      expected: '\"well..\", he said',
    },
    {
      input: "'\"we\\'ll go another day\", he said'",
      expected: '\"we\'ll go another day\", he said'
    },
    {
      input: "'okay'+'doke'",
      expected: 'okaydoke'
    },
    {
      input: " 'okay' ",
      expected: 'okay'
    }
  ];


  tests.forEach(function (test) {
    it('understands the string correctly for "' + test.input + '"', function () {
      var tokens = tokenizer.tokenize(test.input);
      var audit = parser.auditTokens(tokens);
      var parseTree = parser.parse(audit.keptTokens);
      var result = interpreter.evaluate(parseTree.statements, context);
      assert.equal(result, test.expected);
    });
  });


});
