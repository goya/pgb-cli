const format = require('./formatters')

module.exports = (app) => {
  return new Promise((resolve, reject) => {
    let id = app.id
    let timeStarted = Date.now()
    let pollInt, printInt

    let exit = () => {
      clearInterval(pollInt)
      clearInterval(printInt)

      if (app.error !== {} && pgb.opts.exitcode) {
        reject(new Error())
      } else if (app.package) {
        resolve(app)
      } else {
        resolve(pgb.api.getApp(id))
      }
    }

    let secondsToTime = (secs) => {
      secs = Math.round(secs / 1000)
      let m = Math.floor(secs / (60))
      let s = secs - (m * 60)
      if (s < 10) s = '0' + s
      return ` ${m}:${s}`
    }

    let print = (first) => {
      if (!pgb.opts.noprogress) {
        if (!first) process.stderr.write('\x1B[7A')

        let time = secondsToTime(((Date.now()) - timeStarted))
        if (app.completed && time === ' 0:00') time = ''

        process.stderr.write(
          `${'-'.repeat(25)}
${pgb.colours.header(' App Id')}: ${pgb.colours.bold(id)}
${'-'.repeat(25)}
${pgb.colours.header('Android')}: ${format.status(app.status.android)}           
${pgb.colours.header('    iOS')}: ${format.status(app.status.ios)}           
${pgb.colours.header('Windows')}: ${format.status(app.status.winphone)}           
${'-'.repeat(25 - time.length)}${pgb.colours.bold(time)}\n`)
      }
      if (app.completed) exit()
    }

    if (pgb.opts.exit) return exit()

    print(true)

    if (app.completed) return exit()

    pollInt = setInterval(() => {
      pgb.api.getStatus(id)
        .then((status) => { app = status })
        .catch(reject)
    }, 2000)

    printInt = setInterval(print, 1000)
  })
}
