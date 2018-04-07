const prompt = require('../util/prompt')

const signInUser = () => {
  let username, password

  return Promise.resolve(pgb.opts.commands[1] || pgb.opts.variables.auth_token || prompt('Adobe ID or Authentication Token: '))
    .then(token => {
      username = token
      if (!token.match('^[^@]+@[^@]+.[^@]+$')) {
        pgb.api.addAuth(token)
        return { token }
      }
      return prompt('Password: ', { mask: true })
        .then(response => {
          password = response
          pgb.api.addAuth(username, password)
          return pgb.api.getToken(username, password)
        })
    })
    .then(response => {
      pgb.debug(`saving auth_token to ${pgb.session.path}`)
      pgb.session.save({ authtoken: response.token })
      return pgb.api.me()
    })
    .catch((e) => {
      if (e && e.statusCode === 401) {
        let msg = (password) ? 'Adobe ID or password incorrect' : 'invalid authentication token'
        return Promise.reject(new Error(msg))
      } else {
        return Promise.reject(e)
      }
    })
}

module.exports = () => {
  return pgb.api.me()
    .catch(signInUser)
    .then((person) => pgb.print({ pretty: 'signed in as ' + pgb.colours.bold(person.email), json: person, bare: person.id }))
}
