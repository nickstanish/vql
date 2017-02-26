var tokenTypes = require("./tokenTypes").types;
var Token = require("./token");
var NODE_TYPES = require("./nodeTypes");
var ParserError = require('./parserError');

var Node = function (type) {
  this.type = type;
};

var StringNode = function (value) {
  Node.call(this, NODE_TYPES.STRING);
  this.value = value;
};

var NumberNode = function (value) {
  Node.call(this, NODE_TYPES.NUMBER);
  this.value = value;
};

var BooleanNode = function (value) {
  Node.call(this, NODE_TYPES.BOOLEAN);
  this.value = value;
};

var IdentifierNode = function (value) {
  Node.call(this, NODE_TYPES.IDENTIFIER);
  this.value = value;
};

var DataIdentifierNode = function (value) {
  Node.call(this, NODE_TYPES.DATA_IDENTIFIER);
  this.value = value;
};

var PropertyNode = function (object, property) {
  Node.call(this, NODE_TYPES.PROPERTY);
  this.object = object;
  this.property = property;
};

var ArrayPropertyNode = function (object, property) {
  Node.call(this, NODE_TYPES.ARRAY_PROPERTY);
  this.object = object;
  this.property = property;
};

var FunctionNode = function () {};

var FunctionCallNode = function (name, params) {
  Node.call(this, NODE_TYPES.FUNCTION_CALL);
  this.name = name;
  this.params = params;
};

var AssignmentNode = function () {};

var UnaryNode = function (value) {
  Node.call(this, NODE_TYPES.UNARY);
  this.value = value;
};

var BinaryNode = function (operator) {
  Node.call(this, NODE_TYPES.BINARY);
  this.operator = operator;
  this.left = null;
  this.right = null;
};

function Parser () {}

Parser.prototype.auditTokens = function (tokens) {
  var result = {
    keptTokens: [],
    ignoredTokens: []
  };
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    switch (token.type) {
      case tokenTypes.UNKNOWN:
      case tokenTypes.LEFT_CURLY: // unimplemented tokens so ignored
      case tokenTypes.RIGHT_CURLY:
      case tokenTypes.COLON:
        result.ignoredTokens.push(token);
        break;
      default:
        result.keptTokens.push(token);
    }
  }
  return result;
};

var PRECEDENCE = {
  EQUAL: 1,
  // "||": 2,
  // "&&": 3,
  // "<": 7,
  // ">": 7,
  // "<=": 7,
  // ">=": 7,
  // EQUAL: 7,
  // NOT_EQUAL: 7,
  PLUS_SIGN: 10,
  DASH: 10,
  ASTERISK: 20,
  SLASH: 20,
  PERCENT_SIGN: 20
};


// Based on http://lisperator.net/pltut/parser/the-parser
Parser.prototype.parse = function (tokens) {
  // console.log(audit);
  var currentIndex = 0;

  var dataIdentifiers = [];
  var statements = [];
  while (currentIndex < tokens.length) {
    statements.push(parseStatement())
  }
  return {
    statements: statements,
    dataIdentifiers: dataIdentifiers
  };

  function isOperator(token) {
    return token.type in PRECEDENCE;
  }

  function getToken(optionalIndex) {
    return tokens[optionalIndex || currentIndex];
  }

  function next() {
    ++currentIndex;
  }

  function parseStatement() {
    var statement = parseExpression();
    parseEndOfStatement();
    return statement;

  }

  function parseEndOfStatement() {
    var token = getToken();
    if (!token) {
      return true;
    }
    switch (token.type) {
      case tokenTypes.NEWLINE:
      case tokenTypes.SEMICOLON:
        next();
        return true;
      default:
        throw new ParserError(token);
    }
  }


  function parseExpression () {
    return maybeParseBinary(parseValue(), 0);
  }

  function parseValue () {
    var token = getToken();
    if (!token) {
      throw new ParserError(null, 'Unexpected EOF');
    }

    switch (token.type) {
      case tokenTypes.WHITESPACE:
      case tokenTypes.NEWLINE:
        next();
        return parseValue();
      case tokenTypes.SEMICOLON:
        next();
        return parseStatement();
      case tokenTypes.DASH:
        next();
        return new UnaryNode(parseValue());
      case tokenTypes.DIGIT:
        return new NumberNode(parseNumber());
      case tokenTypes.DOUBLE_QUOTE:
      case tokenTypes.SINGLE_QUOTE:
        return new StringNode(parseString());
      case tokenTypes.DOLLAR_SIGN:
        next();
        var dataIdentifier;
        if ([tokenTypes.DOUBLE_QUOTE, tokenTypes.SINGLE_QUOTE].indexOf(getToken().type) >= 0) {
          dataIdentifier = parseString();
        } else {
          dataIdentifier = parseWord();
        }
        dataIdentifiers.push(dataIdentifier);
        return maybeParseProperty(new DataIdentifierNode(dataIdentifier));
      case tokenTypes.UNDERSCORE:
      case tokenTypes.ALPHA:
        var word = parseWord();

        if (getToken() && getToken().type == tokenTypes.LEFT_PARENTHESES) {
          next();
          return parseFunctionCall(word);
        }

        return maybeParseProperty(new IdentifierNode(word));
      case tokenTypes.LEFT_PARENTHESES:
        next();
        var expression = parseExpression();

        token = getToken();
        if (token && token.type == tokenTypes.RIGHT_PARENTHESES) {
          next();
        } else {
          throw new ParserError(token);
        }
        return expression;
      default:
        throw new ParserError(token);
    }
  }

  function parseWord() {
    if (!getToken()) {
      throw new ParserError(null, 'Unexpected EOF');
    }
    var acceptableTokensToBeginWord = [tokenTypes.ALPHA, tokenTypes.UNDERSCORE];
    if (acceptableTokensToBeginWord.indexOf(getToken().type) < 0) {
      throw new ParserError(getToken());
    }
    var combined = "";
    var acceptableTokens = [tokenTypes.ALPHA, tokenTypes.DIGIT, tokenTypes.DASH, tokenTypes.UNDERSCORE];
    while (getToken()) {
      if (acceptableTokens.indexOf(getToken().type) >= 0) {
        combined += getToken().value;
        next();
        continue;
      }
      else break;
   }
   return combined;
  }

  function parseString() {
    var combined = "";
    var quoteType = getToken().type;
    var quoteCompleted = false
    next();

    while (getToken()) {

      if (getToken().type === tokenTypes.BACKSLASH) {
        // escape sequences
        next();
        if (!getToken()) {
          break;
        }
        if (getToken().type === tokenTypes.NEWLINE) {
          combined += "\n";
        } else if (getToken().type === tokenTypes.BACKSLASH) {
          combined += "\\";
        } else if (getToken().value === "t") {
          combined += "\t";
        } else if (getToken().type === quoteType) {
          combined += getToken().value;
        } else {
          // i guess if the escape sequence isn't implemented then we can just pass the backslash
          combined += "\\" + getToken().value;

        }
        next();
        continue;
      }

      if (getToken().type === quoteType) {
        next();
        return combined;
      }
      if (getToken().type === tokenTypes.NEWLINE) {
        return;
      }

      combined += getToken().value;
      next();
    }
    throw new ParserError(getToken());
  }

  function parseNumber() {
    var combined = "";
    var hasPeriod = false;

    while (getToken()) {
      if (getToken().type === tokenTypes.DIGIT) {
        combined += getToken().value;
        next();
        continue;
      }
      else if (getToken().type === tokenTypes.PERIOD && !hasPeriod) {
        hasPeriod = true;
        combined += getToken().value;
        next();
        continue;
      }
      else break;
   }
   if (!hasPeriod) {
     return parseInt(combined);
   }
   return parseFloat(combined);
  }

  function parseFunctionCall(functionName) {
    var params = [];
    var separator = tokenTypes.COMMA;
    while(getToken() && getToken().type !== tokenTypes.RIGHT_PARENTHESES) {
      var expressionNode = parseExpression();
      params.push(expressionNode);
      if (getToken() && getToken().type == separator) {
        next();
      } else if (getToken() && getToken().type !== tokenTypes.RIGHT_PARENTHESES) {
        throw new ParserError(getToken());
      }
    }
    next();
    return new FunctionCallNode(functionName, params);
  }

  function maybeParseProperty (left) {
    var token = getToken();
    if (token && token.type == tokenTypes.PERIOD) {
      next();
      var propertyIdentifier = parseWord();
      var node = new PropertyNode(left, new IdentifierNode(propertyIdentifier));
      return maybeParseProperty(node);
    }
    else if (token && token.type == tokenTypes.LEFT_BRACKET) {
      next();
      var propertyIdentifier = parseExpression();
      var node = new ArrayPropertyNode(left, propertyIdentifier);

      if (getToken() && getToken().type == tokenTypes.RIGHT_BRACKET) {
        next();
      } else {
        throw new ParserError(getToken());
      }
      return maybeParseProperty(node);
    }
    return left;
  }

  function skipWhitespace() {
    while (getToken() && getToken().type === tokenTypes.WHITESPACE) {
      next();
    }
  }

  function maybeParseBinary (left, previousPrecendence) {
    skipWhitespace();
    var token = getToken();
    if (token) {
      var newPrecendence = PRECEDENCE[token.type];
      if (newPrecendence && newPrecendence > previousPrecendence) {

        // [tokenTypes.EXCLAMATION_POINT, tokenTypes.EQUAL] => !=
        // [tokenTypes.EQUAL, tokenTypes.EQUAL] => ==
        // [tokenTypes.DASH] => -
        // [tokenTypes.PLUS_SIGN] => +
        // [tokenTypes.ASTERISK, tokenTypes.ASTERISK] => **
        // [tokenTypes.PLUS_SIGN, tokenTypes.EQUALS] => +=
        // [tokenTypes.DASH, tokenTypes.EQUALS] => -=
        // [tokenTypes.SLASH, tokenTypes.EQUALS] => /=
        // [tokenTypes.ASTERISK, tokenTypes.EQUALS] => *=
        // [tokenTypes.ASTERISK] => *
        // [tokenTypes.PERCENT_SIGN] => %
        // [tokenTypes.GREATER_THAN] => >
        // [tokenTypes.GREATER_THAN, tokenTypes.EQUAL] => >=
        // [tokenTypes.LESS_THAN] => <
        // [tokenTypes.LESS_THAN, tokenTypes.EQUAL] => <=
        // [tokenTypes.AMPERSAND, tokenTypes.AMPERSAND] => &&
        // [tokenTypes.VERTICAL_BAR, tokenTypes.VERTICAL_BAR] => ||
        switch (getToken().type) {
          case tokenTypes.EXCLAMATION_POINT:
          case tokenTypes.EQUAL:
          case tokenTypes.DASH:
          case tokenTypes.PLUS_SIGN:
          case tokenTypes.ASTERISK:
          case tokenTypes.SLASH:
          case tokenTypes.PERCENT_SIGN:
          case tokenTypes.GREATER_THAN:
          case tokenTypes.LESS_THAN:
          case tokenTypes.VERTICAL_BAR:
          case tokenTypes.AMPERSAND:

            next();
            // todo - check for assignment
            var node = new BinaryNode(token.type);
            node.left = left;
            node.right = maybeParseBinary(parseValue(), newPrecendence)
            return maybeParseBinary(node, previousPrecendence);
        }
      }
    }
    return left;
  }

};


function prettyPrint(object) {
  return JSON.stringify(object, null, 4);
}

function _main() {
  var Tokenizer = require("./tokenizer");
  var tokenizer = new Tokenizer()
  var input = "addThree(1,2,3) + 3; 2";
  // var input = "2.5 * (69.99 + 3) + subtract(add(5+3, 9, x))";
  console.log("##### INPUT: " + input);
  var tokens = tokenizer.tokenize(input);
  console.log("##### TOKENS", tokens);
  var parser = new Parser();

  var audit = parser.auditTokens(tokens);
  try {
    console.log("##### PARSE TREE: ", prettyPrint(parser.parse(audit.keptTokens).statements));
  } catch(e) {
    console.error(e);
  }
}
// to test run node <this file>
if (require.main === module) {
  // then this file was run by node
  _main();
}



module.exports = Parser;
