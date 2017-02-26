var tokenTypes = require("./tokenTypes").types;
var Parser = require("./parser");
var NODE_TYPES = require("./nodeTypes");


function Context (sourceData, locals) {
  this._parentContext = {}; // for scope
  this._locals = locals || {}; // assignment and function defs
  this._sourceData = sourceData || {}; // for data_identifiers
}

Context.prototype.getDataIdentifier = function (name) {
  // console.log("getting " + name + " from data identifiers");
  return this._sourceData[name];
};

Context.prototype.get = function (name) {
  return this._locals[name];
};

Context.prototype.set = function (name, value) {
  // todo use parent scopes to find which scope it belongs to
  return this._locals[name] = value;
};

Context.prototype.define = function (name, value) {
  // this set the variable in the current scope
  return this._locals[name] = value;
};

function Interpreter () {}

Interpreter.prototype.handleOperator = function (operator, left, right) {
  // console.log(arguments);
  switch (operator) {
    case tokenTypes.PLUS_SIGN:
      return left + right;
    case tokenTypes.DASH:
      return left - right;
    case tokenTypes.ASTERISK:
      return left * right;
    case tokenTypes.SLASH:
      return left / right;
    case tokenTypes.PERCENT_SIGN:
      return left % right;
    default:
      throw new Error("[VQL Interpreter] Unable to handle operator for " + operator);
  }
};

Interpreter.prototype.evaluate = function (node, context) {
  context = context || new Context();

  if (Array.isArray(node)) {
    var result;
    for (var i = 0; i < node.length; i ++) {
      result = this.evaluate(node[i], context);
    }

    return result;
  }

  switch (node.type) {
    case NODE_TYPES.STRING:
      return node.value;
    case NODE_TYPES.NUMBER:
      return parseFloat(node.value);
    case NODE_TYPES.BOOLEAN:
      return node.value;
    case NODE_TYPES.UNARY:
      return -(this.evaluate(node.value));
    case NODE_TYPES.BINARY:
      if (node.left === null || typeof node.left === 'undefined') {
        return this.handleOperator(node.operator, null, this.evaluate(node.right, context));
      } else {
        return this.handleOperator(node.operator, this.evaluate(node.left, context), this.evaluate(node.right, context));
      }
    case NODE_TYPES.IDENTIFIER:
      return context.get(node.value);
    case NODE_TYPES.DATA_IDENTIFIER:
      return context.getDataIdentifier(node.value);
    case NODE_TYPES.ARRAY_PROPERTY:
      // always evaluate inner property
      var propertyName = this.evaluate(node.property, context);
      return this.evaluate(node.object, context)[propertyName];
    case NODE_TYPES.PROPERTY:
      var propertyName = null;
      if (node.property.type === NODE_TYPES.IDENTIFIER) {
        propertyName = node.property.value;
      } else {
        propertyName = this.evaluate(node.property, context);
      }
      return this.evaluate(node.object, context)[propertyName];
    case NODE_TYPES.FUNCTION_CALL:
      var func = context.get(node.name);
      var self = this;
      var params = node.params.map(function (param) {
        return self.evaluate(param, context);
      });
      return func.apply(null, params);
    case NODE_TYPES.FUNCTION_DEFINITION:
    case NODE_TYPES.ASSIGNMENT:
    default:
      return null;
      throw new Error("[VQL Interpreter] Unable to evaluate node for " + node.type);
  }
};



function _main() {
  var Tokenizer = require("./tokenizer");


  var tokenizer = new Tokenizer();
  var parser = new Parser();
  var interpreter = new Interpreter();

  // var input = "$source.value";
  var input = "add($y[0 + 1], $y[1 + 1])";
  console.log("INPUT: " + input);

  var tokens = tokenizer.tokenize(input);
  // console.log(tokens);
  var audit = parser.auditTokens(tokens);
  // console.log(audit.dataIdentifiers);
  var parseTree = parser.parse(audit.keptTokens);
  // console.log(parseTree);

  var context = new Context({
    y: [5, 5, 3]
  });
  context.set("add", function (a, b) {
      return a + b
    })
  context.set("x", 12);
  context.set("y", {z: {a: 5}});
  // console.log(context.get("x"));
  console.log("### RESULT: ", interpreter.evaluate(parseTree.statements, context));
}
// to test run `node <this file>`
if (require.main === module) {
  _main();
}



module.exports = {
  Interpreter: Interpreter,
  Context: Context
};
