const command = require('../../src/commands/app')
const validators = require('../../src/commands/helpers/validators')
const wait = require('../../src/commands/helpers/wait')
jest.mock('../../src/commands/helpers/wait')
wait.mockResolvedValue('wait')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('app', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: ['app', '12'] })
    pgb.api.getApp = jest.fn(() => Promise.resolve({ id: 12 }))
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete global.pgb
  })

  test('should validate', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(validators.args).toHaveBeenLastCalledWith(1)
        expect(validators.signed_in).toHaveBeenCalled()
        expect(validators.id).toHaveBeenLastCalledWith('12')
      })
  })

  test('should call getApp with id', () => {
    return Promise.resolve()
      .then(command)
      .then((app) => {
        expect(pgb.print).toHaveBeenCalledWith({ 'bare': 12, 'json': { 'id': 12 }, 'pretty': { 'id': 12 } })
      })
  })

  test('should reject on error', (done) => {
    pgb.api.getApp = jest.fn(() => { throw new Error('an error') })
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
      .then(() => expect(complete.app).toHaveBeenCalled())
  )
})
