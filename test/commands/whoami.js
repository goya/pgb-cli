const command = require('../../src/commands/whoami')

describe('whoami', () => {
  beforeEach(() => {
    require('../_helpers/pgb')()
    global.pgb.api.me = jest.fn(() => Promise.resolve({email: 'user@example.com'}))
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should fail if no auth', (done) => {
    global.pgb.api.hasAuth = () => false
    return Promise.resolve()
      .then(command)
      .then(() => done.fail('bad'))
      .catch((e) => {
        expect(e).toMatchObject(new Error('not signed-in'))
        done()
      })
  })

  test('should print out user', () => {
    return Promise.resolve()
      .then(command)
      .then(() =>
        expect(pgb.print).toHaveBeenLastCalledWith({'bare': undefined, 'json': {'email': 'user@example.com'}, 'pretty': 'signed in as user@example.com'})
      )
  })

  test('should reject on error', (done) => {
    global.pgb.api.me = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
        done()
      })
  })
})
