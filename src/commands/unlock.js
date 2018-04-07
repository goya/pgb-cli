const has = require('./helpers/validators')
const unlockKey = require('./helpers/unlock-key')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(2)
  has.signed_in()
  let platform = has.key_platform(pgb.opts.commands[1], true)
  let id = has.id(pgb.opts.commands[2])

  if (platform === 'winphone') {
    return Promise.reject(new Error('"winphone" signing keys are not locked'))
  }

  return unlockKey(platform)
    .then((data) => pgb.api.updateKey(platform, id, { data }))
    .then((key) => pgb.print({
      pretty: `${pgb.colours.bold(platform)} key ${pgb.colours.bold(id)} unlocked`,
      json: key,
      bare: key.id
    }))
}

module.exports.completion = () => complete.key()
