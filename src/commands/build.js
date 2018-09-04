const has = require('./helpers/validators')
const wait = require('./helpers/wait')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(1)
  has.signed_in()
  let id = has.id(pgb.opts.commands[1])
  let platforms = pgb.opts.commands.slice(2).join(',').split(',')

  platforms = platforms.map(has.platform)

  return pgb.api.buildApp(id, platforms)
    .then(wait)
    .then((app) => pgb.print({ bare: app.id, json: app }))
}

module.exports.completion = complete.appAndPlatform
