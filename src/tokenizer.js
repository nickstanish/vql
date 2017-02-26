var TokenTypes = require("./tokenTypes");
var tokenMap = TokenTypes.tokenMap;
var tokenPatterns = TokenTypes.tokenPatterns;
var Token = require("./token");

function Tokenizer() {}

Tokenizer.prototype.tokenize = function (input) {
  var line = 1;
  var column = 1;
  var tokens = [];

  var currentIndex = 0;
  var previousCharacter;
  var currentCharacter;

  function next() {
    currentIndex++;
    column++;
  }

  while (currentIndex < input.length) {
    previousCharacter = currentCharacter;
    var currentCharacter = input[currentIndex];

    if (tokenMap[currentCharacter]) {
      tokens.push(new Token(tokenMap[currentCharacter], currentCharacter, line, column));
      next();
      if (currentCharacter === "\n") {
        line++;
        column = 1;
      }
      continue;
    }
    if (tokenPatterns.some(function(element) {
      if (element.pattern.test(currentCharacter)) {
        tokens.push(new Token(element.type, currentCharacter, line, column));
        return true
      }
      return false;
    })) {
      next();
      continue;
    }

    tokens.push(new Token(tokenTypes.UNKNOWN, currentCharacter, line, column));
    next();
  }

  return tokens;
};

function _main() {
  var tokenizer = new Tokenizer()
  // var input = "x = 1235.2323.\n+ 6, % - * / ($\". -(\\\'data) \".\"cool - shit\")" + "  \"hows it going???!\" { x: 5, y: z } ";
  var input = "x,$y.value,z(),abcdef(g) $source. $valuehi"
  console.log("INPUT: " + input);
  console.log(tokenizer.tokenize(input));
}
// to test run node <this file>
if (require.main === module) {
  // then this file was run by node
  _main();
}


module.exports = Tokenizer;
