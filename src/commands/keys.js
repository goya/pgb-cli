const easyTable = require('easy-utf8-table')
const format = require('./helpers/formatters')
const has = require('./helpers/validators')
const complete = require('./helpers/complete')

module.exports = () => {
  let platform
  let bare = []

  has.signed_in()
  platform = has.key_platform(pgb.opts.commands[1], false)

  const locked_format = (val, width) => {
    val = val ? pgb.colours.error('LOCKED') : pgb.colours.done('UNLOCKED')
    return easyTable.rightPadder(' ')(val, width)
  }

  const printForPlatform = (data, platform) => {
    let str = pgb.colours.header('Platform: ') + pgb.colours.bold(platform)
    str = str.concat('\n\n')

    if (data.length === 0) {
      return str.concat('no keys\n')
    }

    let table = new easyTable() /* eslint-disable-line new-cap */
    data.forEach(function(key) {
      bare.push(key.id)
      table.cell(pgb.colours.header('Key Id'), key.id.toString())
      if (platform === 'ios') {
        table.cell(pgb.colours.header('Title                     '), format.trunc(key.title, 26))
        table.cell(pgb.colours.header('Default  '), key.default ? 'YES' : '')
        table.cell(pgb.colours.header('Status  '), key.locked, locked_format)
      } else if (platform === 'winphone') {
        table.cell(pgb.colours.header('Title                                          '), format.trunc(key.title, 47))
      } else {
        table.cell(pgb.colours.header('Title                                '), format.trunc(key.title, 37))
        table.cell(pgb.colours.header('Status  '), key.locked, locked_format)
      }
      table.cell(pgb.colours.header('Last Used '), key.last_used ? format.date(new Date(key.last_used)) : 'NEVER')
      table.cell(pgb.colours.header('Uploaded  '), format.date(new Date(key.created_at)))
      table.newRow()
    })
    str = str.concat(table.toString().trim())
    return str.concat('\n\n')
  }

  const print = (data) => {
    let str = '\n'

    if (Array.isArray(data.keys)) {
      str = str.concat(printForPlatform(data.keys, platform))
    } else {
      str = str.concat(printForPlatform(data.keys.ios.all, 'ios'))
      str = str.concat(printForPlatform(data.keys.android.all, 'android'))
      str = str.concat(printForPlatform(data.keys.windows.all, 'windows'))
      str = str.concat(printForPlatform(data.keys.winphone.all, 'winphone'))
    }
    pgb.print({
      pretty: '\n' + str.trim() + '\n',
      json: data,
      bare: bare.join('\n')
    })
  }

  return pgb.api.getKeys(platform).then(print)
}

module.exports.completion = () => complete.platform(true)
