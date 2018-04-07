const command = require('../../src/commands/wait')
const validators = require('../../src/commands/helpers/validators')
const wait = require('../../src/commands/helpers/wait')
jest.mock('../../src/commands/helpers/wait')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

jest.useFakeTimers()

describe('wait', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'wait', '12' ] })
    pgb.api.getApp = jest.fn(() => Promise.resolve({ id: 12 }))
    wait.mockResolvedValue()
    jest.clearAllMocks()
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should validate', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(validators.args).toHaveBeenLastCalledWith(1)
        expect(validators.signed_in).toBeCalled()
      })
  })

  test('should wait for app', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(wait).toBeCalledWith({ id: 12 })
      })
  })

  test('should reject on error', () => {
    wait.mockRejectedValue(new Error('an error'))
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.app).toBeCalled())
  )
})
