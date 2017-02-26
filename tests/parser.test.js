var chai = require("chai");
// var assert = chai.assert;
var expect = chai.expect;

var Tokenizer = require("../src/tokenizer");
var Parser = require("../src/parser");
var ParserError = require("../src/parserError");
var interpreterLib = require("../src/interpreter");
var Interpreter = interpreterLib.Interpreter;
var Context = interpreterLib.Context;

describe('Parser', function () {
  var tokenizer = new Tokenizer();
  var parser = new Parser();
  var interpreter = new Interpreter();

  describe('Should Fail', function () {
    var context = new Context();
    var tests = [
      "3 + ",
      "(",
      ")",
      "[",
      // "\"string", currently parsed as string
      // "string\"", currently parsed as identifier and UNKNOWN
      "4 4",
      "2[s]",
      "add(1, 2)w"
    ];

    tests.forEach(function (test) {
      it('throws a ParserError for "' + test + '"', function () {
        var tokens = tokenizer.tokenize(test);
        var audit = parser.auditTokens(tokens);
        expect(function () {
          parser.parse(audit.keptTokens)
        }).to.throw(ParserError);
      });
    });

  });

});
