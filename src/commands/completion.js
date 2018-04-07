const fs = require('fs')

const getCommandIndex = () => {
  let idx = 0
  let args = process.argv.slice(2)
  for (let i = 0; i < pgb.opts.variables.idx; i++) {
    if (!args[i].startsWith('-')) idx++
    if (args[i].match(/[><]/)) throw new Error('pipe')
  }
  return idx
}

module.exports = () => {
  try {
    pgb.opts.idx = getCommandIndex()

    if (pgb.opts.idx === 0) { // no command specified
      var commands = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'))
      commands = commands.map(file => file.slice(0, -3))
      let remove = [ 'usage', 'completion' ]
      commands = commands.filter((val) => remove.indexOf(val) === -1)
      console.log(commands.join('\n'))
    } else { // command has been specified
      let file = `${__dirname}/${pgb.opts.commands[0]}.js`
      if (fs.existsSync(file)) {
        return Promise.resolve(require(file).completion())
          .then(completions => console.log((completions || ['']).join('\n')))
          .catch((e) => pgb.debug(e))
      }
    }
  } catch (e) { pgb.debug(e) }

  return Promise.resolve()
}
