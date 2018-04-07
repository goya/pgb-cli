const prompt = require('../../util/prompt')
const series = require('../../util/misc').promiseSeries

const promptForAndroid = () => {
  let keystore_pw = pgb.opts.variables.keystore_password
  delete pgb.opts.variables.keystore_password

  let key_pw = pgb.opts.variables.key_password
  delete pgb.opts.variables.key_password

  return series(
    () => keystore_pw || prompt('Keystore Password: ', { mask: true }),
    () => key_pw || prompt('Private Key Password: ', { mask: true })
  ).then(data => {
    return { keystore_pw: data[0], key_pw: data[1] }
  })
}

const promptForIOSAndWindows = () => {
  let password = pgb.opts.variables.key_password
  delete pgb.opts.variables.key_password

  if (password) {
    return Promise.resolve({ password })
  } else {
    return prompt('Key Password: ', { mask: true })
      .then((password) => { return { password } })
  }
}

module.exports = platform => {
  if (platform === 'android') {
    return promptForAndroid()
  } else {
    return promptForIOSAndWindows()
  }
}
