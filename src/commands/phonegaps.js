const easyTable = require('easy-utf8-table')
const has = require('./helpers/validators')

module.exports = () => {
  const print = (data) => {
    let table = new easyTable() /* eslint-disable-line new-cap */
    let phonegaps = data.by_phonegap
    let rev = []
    let str = ''

    for (let version in phonegaps) { rev.unshift(version) }
    let colour = pgb.colours.default

    for (let version of rev) {
      (version === data.default) ? colour = pgb.colours.bold : colour = pgb.colours.default
      table.cell(pgb.colours.header('PhoneGap'), colour(version))
      table.cell(pgb.colours.header('Android'), colour(phonegaps[version].android))
      table.cell(pgb.colours.header('iOS'), colour(phonegaps[version].ios))
      table.cell(pgb.colours.header('Windows'), colour(phonegaps[version].winphone))
      table.newRow()
    }

    str = str.concat('\n')
    str = str.concat(pgb.colours.header('Default: ') + pgb.colours.bold(data.default))
    str = str.concat('\n\n')
    str = str.concat(table.toString().trim())
    str = str.concat('\n')

    pgb.print(str, data)
  }

  has.signed_in()

  return pgb.api.currentSupport().then(print)
}
