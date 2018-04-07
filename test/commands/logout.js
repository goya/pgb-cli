const command = require('../../src/commands/logout')

describe('logout', () => {
  beforeEach(() => {
    require('../_helpers/pgb')()
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should fail if no auth', () => {
    pgb.session.clear = jest.fn(() => true)
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.session.clear).toHaveBeenCalled()
        expect(pgb.print).toHaveBeenLastCalledWith('you have been signed out')
      })
  })

  test('should reject on error', (done) => {
    pgb.session.clear = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
        done()
      })
  })
})
