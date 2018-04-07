const has = require('./helpers/validators')

module.exports = () => {
  has.signed_in()

  return pgb.api.me()
    .then(person =>
      pgb.print({ pretty: `signed in as ${pgb.colours.bold(person.email)}`, json: person, bare: person.id })
    )
}
