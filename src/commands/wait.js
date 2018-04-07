const has = require('./helpers/validators')
const wait = require('./helpers/wait')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(1)
  let id = has.id(pgb.opts.commands[1])
  has.signed_in()

  return pgb.api.getApp(id)
    .then(wait)
    .then(pgb.json)
}

module.exports.completion = complete.app
