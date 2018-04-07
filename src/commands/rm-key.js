const has = require('./helpers/validators')
const prompt = require('../util/prompt')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(2)
  has.signed_in()
  let id = has.id(pgb.opts.commands[2])
  let platform = has.key_platform(pgb.opts.commands[1], true)

  let confirm = Promise.resolve()
  if (!pgb.opts.force) {
    confirm = prompt('are you sure? [yN] ', { confirm: true })
  }

  return confirm
    .then(() => pgb.api.deleteKey(platform, id))
    .then(() => pgb.print({
      pretty: `${pgb.colours.bold(platform)} key ${pgb.colours.bold(id)} deleted`,
      bare: id
    }))
}

module.exports.completion = () => complete.key(true)
