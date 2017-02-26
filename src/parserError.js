function ParserError (token, message) {
  this.name = 'ParserError';

  if (token) {
    this.token = token;
    this.message = "ParserError: Unexpected Token '" + token.type + "', '" + token.value + "'" + "', at " + token.line + ":" + token.column;
  } else {
    this.message = "ParserError: " + message;
  }

  this.stack = (new Error(this.message)).stack;
}
ParserError.prototype = Object.create(Error.prototype);
ParserError.prototype.constructor = ParserError;

module.exports = ParserError;
