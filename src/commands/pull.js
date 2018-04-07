const complete = require('./helpers/complete')

module.exports = () => {
  pgb.opts.variables.pull = true
  return require('./update')()
}

module.exports.completion = complete.app
