const key_platforms = { valid: ['ios', 'android', 'winphone', 'windows'], alias: { wp8: 'winphone' } }
const app_platforms = { valid: ['ios', 'android', 'winphone'], alias: { windows: 'winphone', wp8: 'winphone' } }
const colours = require('../../util/colours')

module.exports.args = (num) => {
  if (pgb.opts.commands.length - 1 < num) {
    pgb.print(colours.error(`command requires ${num} argument(s)`))
    pgb.opts.short_usage = true
    require('../usage')()
    throw new Error()
  }
}

module.exports.key_platform = (os, required) => {
  const val = key_platforms.alias[os] || os || ''

  if (required && val === '') {
    throw new Error('no platform specified')
  } else if (val !== '' && key_platforms.valid.indexOf(val) === -1) {
    throw new Error(`"${val}" is not a supported platform (ios,android,windows,winphone)`)
  }
  return val
}

module.exports.platform = (platform, required) => {
  const val = app_platforms.alias[platform] || platform || ''

  if (required && val === '') {
    throw new Error('no platform specified')
  } else if (val !== '' && app_platforms.valid.indexOf(val) === -1) {
    throw new Error(`"${val}" is not a supported platform (ios,android,windows)`)
  }
  return val
}

module.exports.variables = (...required) => {
  let missing = []

  for (let variable of required) {
    let value = pgb.opts.variables[variable]
    if (value === undefined || value === '') {
      missing.push(variable)
    }
  }

  if (missing.length > 0) {
    throw new Error(`missing value(s) for "${missing.join('", "')}"`)
  }
}

module.exports.id = (id) => {
  if ((id || ' ').match(/[^0-9]/)) {
    throw new Error(`"${id}" is not a valid id`)
  }
  return id
}

module.exports.signed_in = (os) => {
  if (!pgb.api.hasAuth()) {
    throw new Error('not signed-in')
  }
}
