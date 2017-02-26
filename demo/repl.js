var readline = require('readline');
var VQL = require('../lib/index');
var Tokenizer = VQL.Tokenizer;
var Parser = VQL.Parser;


var tokenizer = new Tokenizer();
var parser = new Parser();
var interpreter = new VQL.Interpreter();

var context = new VQL.Context();
context.set("add", function (a, b) {
  return a + b
});

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "[VQL] > "
});


rl.prompt();

rl.on('line', (line) => {
  line = line.trim();
  if (/^exit\s?$/i.test(line)) {
    rl.close();
    return;
  }

  try {
    var tokens = tokenizer.tokenize(line);
    var audit = parser.auditTokens(tokens);
    var parseTree = parser.parse(audit.keptTokens);
    console.log(interpreter.evaluate(parseTree.statements, context));
  } catch (e) {
    console.error(e);
  }

  rl.prompt();
}).on('close', () => {
  process.exit(0);
});
