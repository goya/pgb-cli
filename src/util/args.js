const merge = require('./misc').merge

module.exports = (opts) => {
  return new Promise((resolve, reject) => {
    let result = { commands: [], variables: {} }
    let variables = {}
    let envs = {}
    let pipe = {}

    const parseArgs = args => {
      for (let arg of args) {
        for (let flag in opts.flags) {
          if (arg === flag || opts.flags[flag].indexOf(arg) >= 0) {
            result[flag] = true
            break
          }
        }
      }
    }

    const parseVariable = arg => {
      let args = arg.split('=')
      variables[args.shift().toLowerCase()] = args.join('=')
    }

    let rawArgs = process.argv.slice(2)
    for (let arg of rawArgs) {
      if (arg.startsWith('--')) parseArgs([arg.replace(/-/g, '')])
      else if (arg.startsWith('-')) parseArgs(arg.slice(1))
      else if (arg.indexOf('=') > -1) parseVariable(arg)
      else result.commands.push(arg.toLowerCase())
    }

    if (result.commands[0]) {
      result.commands[0] = opts.aliases[result.commands[0]] || result.commands[0]
    }

    for (let envKey in process.env) {
      let key = envKey.toLowerCase()
      if (key.startsWith('pgb_')) {
        key = key.slice(4)
        envs[key] = process.env[envKey]
      }
    }

    if (process.stdin.isTTY) {
      result.variables = merge(envs, variables)
      return resolve(result)
    }

    let data = []

    process.stdin.on('data', line => data.push(line))

    process.stdin.once('end', () => {
      let raw = data.join('').trim()
      if (raw.length > 0) {
        try {
          pipe = JSON.parse(raw)
        } catch (e) {
          return reject(new Error('piped data is invalid json'))
        }
      }
      result.variables = merge(envs, pipe, variables)
      return resolve(result)
    })
  })
}
