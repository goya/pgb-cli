const command = require('../../src/commands/update')
const validators = require('../../src/commands/helpers/validators')
const BindTransfer = require('../../src/commands/helpers/bind-progress')
jest.mock('../../src/commands/helpers/bind-progress')
const wait = require('../../src/commands/helpers/wait')
jest.mock('../../src/commands/helpers/wait')
wait.mockResolvedValue({ id: 12 })
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('update', () => {
  let stop

  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'update', '12', 'org/repo' ], variables: { hydrates: true } })
    pgb.api.updateApp = jest.fn(() => Promise.resolve({ id: 12 }))
    stop = jest.fn()
    BindTransfer.mockReturnValue({ stop })
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
        expect(validators.signed_in).toHaveBeenCalled()
        expect(validators.id).toHaveBeenLastCalledWith('12')
      })
  })

  test('should update app', () => {
    pgb.opts.force = true
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toHaveBeenCalledWith('app 12 updated')
        expect(pgb.api.updateApp).toHaveBeenCalledWith('12', 'org/repo', { 'hydrates': true, 'keys': {}, ignore: [] })
        expect(BindTransfer).toHaveBeenCalled()
      })
  })

  test('should reject on error and stop progress', () => {
    pgb.api.updateApp = jest.fn().mockRejectedValue(new Error('an error'))
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(stop).toHaveBeenCalled()
        expect(err).toMatchObject(new Error('an error'))
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.app).toHaveBeenCalled())
  )
})
