const readline = require('readline')

module.exports = (prompt, opts) => {
  opts = opts || {}
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    process.stdin.on('data', char => {
      char = char + ''
      switch (char) {
        case '\u001b': // escape
        case '\u0003': // ctrl-c
        case '\u0004': // ctrl-d

          process.stdout.write('\r\n')
          process.exit(1)

        case '\n':
        case '\r':

          rl.close()
          break

        default:

          if (opts.mask) {
            let mask = '\x1B[2K\x1B[200D' + prompt + Array(rl.line.length + 1).join('*')
            process.stdout.write(mask)
          }
          break
      }
    })

    rl.question(prompt, value => {
      if (opts.confirm && value.toLowerCase()[0] !== 'y') {
        reject(new Error())
      } else {
        resolve(value)
      }
    })
  })
}
