const fs = require('fs')

module.exports.addFiles = (obj, ...files) => {
  for (let file of files) {
    file = file.split(':')
    let varName = file.shift()
    let arg = pgb.opts.variables[varName]
    if (arg) {
      let key = file.join('') || varName
      try {
        fs.closeSync(fs.openSync(arg, 'r'))
        obj[key] = fs.createReadStream(arg)
      } catch (e) {
        throw new Error(`file "${arg}" not found or cannot be read - ${e}`)
      }
    }
  }
  return obj
}

module.exports.addVariables = (obj, ...fields) => {
  for (let field of fields) {
    field = field.split(':')
    let arg = field.shift()
    let key = field.join('') || arg
    if (pgb.opts.variables[arg.toLowerCase()]) {
      obj[key] = pgb.opts.variables[arg.toLowerCase()]
    }
  }
  return obj
}
