const rawColours = {
  _NONE: '%s',
  _RESET: '\x1B[0m%s',
  _BOLD: '\x1B[1m%s\x1B[0m',
  _UNDERSCORE: '\x1B[4m%s\x1B[0m',
  _GREY: '\x1B[30m%s\x1B[39m',
  _RED: '\x1B[31m%s\x1B[39m',
  _GREEN: '\x1B[32m%s\x1B[39m',
  _YELLOW: '\x1B[33m%s\x1B[39m',
  _BLUE: '\x1B[34m%s\x1B[39m',
  _MAGENTA: '\x1B[35m%s\x1B[39m',
  _CYAN: '\x1B[36m%s\x1B[39m',
  _WHITE: '\x1B[37m%s\x1B[39m'
}

const aliases = {
  default: rawColours._NONE,
  debug: rawColours._NONE,
  done: rawColours._GREEN,
  bold: rawColours._BOLD,
  error: rawColours._RED,
  header: rawColours._BOLD,
  pending: rawColours._YELLOW
}

const colours = {
  disabled: false
}

for (let colour in aliases) {
  let col = aliases[colour]
  colours[colour] = function(str) {
    if (colours.disabled) return str
    return col.replace('%s', str)
  }
}

module.exports = colours
