const has = require('./helpers/validators')
const complete = require('./helpers/complete')

module.exports = () => {
  has.args(2)
  has.signed_in()
  let id = has.id(pgb.opts.commands[1])
  let platform = has.platform(pgb.opts.commands[2], true)

  return pgb.api.getAppLog(id, platform)
    .then(log => pgb.print(log.log, log))
}

module.exports.completion = complete.appAndPlatform
