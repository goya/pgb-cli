const command = require('../../src/commands/new')
const validators = require('../../src/commands/helpers/validators')
const BindTransfer = require('../../src/commands/helpers/bind-progress')
jest.mock('../../src/commands/helpers/bind-progress')
const wait = require('../../src/commands/helpers/wait')
jest.mock('../../src/commands/helpers/wait')
wait.mockResolvedValue({ id: 12 })

describe('new', () => {
  let stop

  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'new', 'org/repo' ], variables: { hydrates: true } })
    pgb.api.addApp = jest.fn(() => Promise.resolve({ id: 12 }))
    stop = jest.fn()
    BindTransfer.mockReturnValue({
      stop
    })
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
      })
  })

  test('should add app', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toHaveBeenCalledWith('app 12 added')
        expect(pgb.api.addApp).toHaveBeenCalledWith('org/repo', { 'hydrates': true, 'keys': {}, ignore: [] })
        expect(BindTransfer).toHaveBeenCalled()
      })
  })

  test('should reject on error and stop progress', () => {
    pgb.api.addApp = jest.fn().mockRejectedValue(new Error('an error'))
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(stop).toHaveBeenCalled()
        expect(err).toMatchObject(new Error('an error'))
      })
  })
})
