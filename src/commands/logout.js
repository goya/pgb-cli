module.exports = () => {
  pgb.session.clear()
  pgb.debug(`deleting ${pgb.session.path}`)
  pgb.print('you have been signed out')
}
