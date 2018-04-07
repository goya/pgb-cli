const has = require('./helpers/validators')
const prompt = require('../util/prompt')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(1)
  has.signed_in()
  let id = has.id(pgb.opts.commands[1])

  let confirm = (pgb.opts.force) ? Promise.resolve() : prompt('are you sure? [yN] ', { confirm: true })

  return confirm
    .then(() => pgb.api.deleteApp(id))
    .then(() => pgb.print({
      pretty: `app ${pgb.colours.bold(id)} deleted`,
      bare: id
    }))
}

module.exports.completion = complete.app
