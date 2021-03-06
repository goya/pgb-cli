const has = require('./helpers/validators')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(2)
  has.signed_in()
  let platform = has.key_platform(pgb.opts.commands[1], true)
  let id = has.id(pgb.opts.commands[2])

  return pgb.api.lockKey(platform, id)
    .then((key) => pgb.print({
      pretty: `${pgb.colours.bold(platform)} key ${pgb.colours.bold(key.id)} locked`,
      json: key,
      bare: key.id
    }))
}

module.exports.completion = () => complete.key()
