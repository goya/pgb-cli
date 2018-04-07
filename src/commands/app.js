const has = require('./helpers/validators')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(1)
  has.signed_in()
  let id = has.id(pgb.opts.commands[1])

  return pgb.api.getApp(id)
    .then(app => pgb.print({ pretty: app, json: app, bare: app.id }))
}

module.exports.completion = complete.app
