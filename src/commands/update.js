const has = require('./helpers/validators')
const appHelper = require('./helpers/app')
const BindProgress = require('./helpers/bind-progress')
const wait = require('./helpers/wait')
const complete = require('./helpers/complete')

module.exports = () => {
  has.signed_in()
  has.args(1)
  let id = has.id(pgb.opts.commands[1])

  let progress = BindProgress()

  return pgb.api.updateApp(id, pgb.opts.commands[2], appHelper.getData())
    .then((app) => {
      pgb.print(`app ${pgb.colours.bold(app.id)} updated`)
      return wait(app).then((app) =>
        pgb.print({ json: app, bare: app.id })
      )
    })
    .catch(error => {
      progress.stop()
      throw error
    })
}

module.exports.completion = complete.app
