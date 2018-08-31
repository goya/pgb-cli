const command = require('../../src/commands/key')
const validators = require('../../src/commands/helpers/validators')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('key', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: ['key', 'ios', '12'] })
    pgb.api.getKey = jest.fn(() => Promise.resolve({ id: 12 }))
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should validate', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(validators.args).toHaveBeenLastCalledWith(2)
        expect(validators.signed_in).toBeCalled()
        expect(validators.key_platform).toHaveBeenLastCalledWith('ios', true)
        expect(validators.id).toHaveBeenLastCalledWith('12')
      })
  })

  test('should call buildApp with id', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'id': 12 }, 'pretty': { 'id': 12 } })
        expect(pgb.api.getKey).toBeCalledWith('ios', '12')
      })
  })

  test('should reject on error', (done) => {
    pgb.api.getKey = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
        done()
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.key).toBeCalledWith(true))
  )
})
