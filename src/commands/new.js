const has = require('./helpers/validators')
const appHelper = require('./helpers/app')
const BindProgress = require('./helpers/bind-progress')
const wait = require('./helpers/wait')

module.exports = () => {
  has.signed_in()
  has.args(1)

  let progress = BindProgress()
  let repoOrFile = pgb.opts.commands[1]

  return pgb.api.addApp(repoOrFile, appHelper.getData(repoOrFile))
    .then(app => {
      pgb.print(`app ${pgb.colours.bold(app.id)} added`)
      return wait(app).then((app) => pgb.print({ bare: app.id, json: app }))
    })
    .catch(error => {
      progress.stop()
      throw error
    })
}
