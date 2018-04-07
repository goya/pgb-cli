const has = require('./helpers/validators')
const payload = require('./helpers/payload')
const complete = require('./helpers/complete')

module.exports = () => {
  let data = {}

  has.args(2)
  has.signed_in()
  let platform = has.key_platform(pgb.opts.commands[1], true)
  let id = has.id(pgb.opts.commands[2])
  payload.addVariables(data, 'title', 'default', 'lock')

  return pgb.api.updateKey(platform, id, data)
    .then(key => pgb.print({
      pretty: `${pgb.colours.bold(platform)} key ${pgb.colours.bold(key.id)} updated`,
      json: key,
      bare: key.id
    }))
}

module.exports.completion = () => complete.key(true)
