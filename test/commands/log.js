const command = require('../../src/commands/log')
const validators = require('../../src/commands/helpers/validators')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('log', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: ['log', '12', 'ios'] })
    pgb.api.getAppLog = jest.fn(() => Promise.resolve({ id: 12, log: 'full log' }))
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
        expect(validators.platform).toHaveBeenLastCalledWith('ios', true)
        expect(validators.id).toHaveBeenLastCalledWith('12')
      })
  })

  test('should print log', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith('full log', { id: 12, log: 'full log' })
        expect(pgb.api.getAppLog).toBeCalledWith('12', 'ios')
      })
  })

  test('should reject on error', () => {
    pgb.api.getAppLog = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.appAndPlatform).toBeCalled())
  )
})
