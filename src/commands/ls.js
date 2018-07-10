const EasyTable = require('easy-utf8-table')
const format = require('./helpers/formatters')
const has = require('./helpers/validators')

const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())

const print = (data) => {
  let title_length = (15 + Math.max(process.stdout.columns - 80, 0)) || 80
  let str = ''
  let bare = []

  let status_format = (val, width) => {
    val = format.status(val)
    return EasyTable.rightPadder(' ')(val, 8)
  }

  let table = new EasyTable()
  data.apps.forEach(function(app) {
    bare.push(app.id)
    table.cell(pgb.colours.header('App Id '), app.id.toString())
    table.cell(pgb.colours.header('Title'), format.trunc(app.title, title_length))

    if (pgb.opts.commands.length === 1) {
      table.cell(pgb.colours.header('Version'), format.trunc(app.version || '', 11))
      table.cell(pgb.colours.header('iOS'), app.status.ios, status_format)
      table.cell(pgb.colours.header('Android'), app.status.android, status_format)
      table.cell(pgb.colours.header('Windows'), app.status.winphone, status_format)
      table.cell(pgb.colours.header('Last Built'), app.last_build ? format.date(app.last_build) : '')
    }

    for (let i = 1; i < pgb.opts.commands.length; i++) {
      let val = app[pgb.opts.commands[i]]
      if (!val) val = ''
      table.cell(
        pgb.colours.header(toTitleCase(pgb.opts.commands[i].replace('_', ' '))),
        (typeof val === 'string') ? val : require('util').inspect(val).replace('\n', '')
      )
    }

    table.newRow()
  })

  str = str.concat('\n')
  if (table.toString().trim() === '') {
    str = '\nno apps\n'
  } else {
    str = str.concat(table.toString())
  }

  pgb.print({ pretty: str, json: data, bare: bare.join('\n') })
}

module.exports = () => {
  has.signed_in()

  return pgb.api.getApps().then(print)
}
