const fs = require('fs')

module.exports = () => {
  let cmd = pgb.opts.commands[0] || 'default'
  let file = `${__dirname}/usage/${cmd}.txt`

  if (!fs.existsSync(file)) {
    pgb.error(`unkown command '${cmd}'`)
    file = `${__dirname}/usage/default.txt`
  }

  file = fs.readFileSync(file, 'UTF-8')

  if (pgb.opts.short_usage) {
    file = file.split('\n', 1)[0]
  }

  pgb.print(file)
}
