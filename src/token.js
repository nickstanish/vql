function Token (type, value, line, column) {
  this.type = type;
  this.value = value;
  this.line = line;
  this.column = column;
}

module.exports = Token;
