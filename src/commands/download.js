const has = require('./helpers/validators')
const format = require('./helpers/formatters')
const Progress = require('../util/progress')
const complete = require('./helpers/complete')

module.exports = () => {
  let progress

  has.args(2)
  has.signed_in()
  let id = has.id(pgb.opts.commands[1])
  let platform = has.platform(pgb.opts.commands[2], true)
  let filePath = pgb.opts.commands[3] || '.'

  let apiRead = status => {
    if (!progress) {
      progress = new Progress('downloading ', status.size, 40)
      progress.start()
    }
    progress.update(status.pos, `${format.size(status.pos)} / ${format.size(status.size)}`)
  }

  process.once('api/connect', (res) => {
    if (pgb.opts.stdout) return
    if (res.statusCode === 200) {
      pgb.print(`downloading to ${res.path}`)
      process.on('api/read', apiRead)
    }
  })

  if (pgb.opts.stdout) filePath = process.stdout

  return pgb.api.downloadApp(id, platform, filePath)
    .then((savedLocation) => {
      if (progress) progress.stop()
    })
}

module.exports.completion = complete.appAndPlatform
