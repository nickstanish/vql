var types = {
  LEFT_PARENTHESES:   "LEFT_PARENTHESES",
  RIGHT_PARENTHESES:  "RIGHT_PARENTHESES",
  LEFT_BRACKET:       "LEFT_BRACKET",
  RIGHT_BRACKET:      "RIGHT_BRACKET",
  LEFT_CURLY:         "LEFT_CURLY",
  RIGHT_CURLY:        "RIGHT_CURLY",
  WHITESPACE:         "WHITESPACE",
  ALPHA:              "ALPHA",
  DIGIT:              "DIGIT",
  SEMICOLON:          "SEMICOLON",
  COLON:              "COLON",
  PERIOD:             "PERIOD",
  COMMA:              "COMMA",
  NEWLINE:            "NEWLINE",
  UNKNOWN:            "UNKNOWN",
  SINGLE_QUOTE:       "SINGLE_QUOTE",
  DOUBLE_QUOTE:       "DOUBLE_QUOTE",
  PLUS_SIGN:          "PLUS_SIGN",
  DASH:               "DASH",
  ASTERISK:           "ASTERISK",
  PERCENT_SIGN:       "PERCENT_SIGN",
  SLASH:              "SLASH",
  EQUALS_SIGN:        "EQUALS_SIGN",
  BACKSLASH:          "BACKSLASH",
  AMPERSAND:          "AMPERSAND",
  VERTICAL_BAR:       "VERTICAL_BAR",
  EXCLAMATION_POINT:  "EXCLAMATION",
  QUESTION_MARK:      "QUESTION_MARK",
  GREATER_THAN:       "GREATER_THAN",
  LESS_THAN:          "LESS_THAN",
  DOLLAR_SIGN:        "DOLLAR_SIGN",
  UNDERSCORE:        "UNDERSCORE"
};

var tokenPatterns = [
  {
    pattern: /\s/,
    type: types.WHITESPACE
  },
  {
    pattern: /\d/,
    type: types.DIGIT
  },
  {
    pattern: /[a-zA-Z]/,
    type: types.ALPHA
  }
]

var tokenMap = {
  ";": types.SEMICOLON,
  "(": types.LEFT_PARENTHESES,
  ")": types.RIGHT_PARENTHESES,
  "[": types.LEFT_BRACKET,
  "]": types.RIGHT_BRACKET,
  "=": types.EQUALS_SIGN,
  ".": types.PERIOD,
  ",": types.COMMA,
  "{": types.LEFT_CURLY,
  "}": types.RIGHT_CURLY,
  ":": types.COLON,
  "+": types.PLUS_SIGN,
  "-": types.DASH,
  "_": types.UNDERSCORE,
  "/": types.SLASH,
  "*": types.ASTERISK,
  "%": types.PERCENT_SIGN,
  "&": types.AMPERSAND,
  "|": types.VERTICAL_BAR,
  "!": types.EXCLAMATION_POINT,
  "?": types.QUESTION_MARK,
  ">": types.GREATER_THAN,
  "<": types.LESS_THAN,
  "$": types.DOLLAR_SIGN,
  "'": types.SINGLE_QUOTE,
  "\n": types.NEWLINE,
  "\\": types.BACKSLASH,
  "\"": types.DOUBLE_QUOTE

};



module.exports = {
  types: types,
  tokenMap: tokenMap,
  tokenPatterns: tokenPatterns
};
