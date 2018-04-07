const command = require('../../src/commands/unlock')
const validators = require('../../src/commands/helpers/validators')
const prompt = require('../../src/util/prompt')
jest.mock('../../src/util/prompt')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('unlock', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'rm-key', 'ios', '12' ] })
    pgb.api.updateKey = jest.fn(() => Promise.resolve({ id: 12 }))
    prompt.mockResolvedValue('password')
    jest.clearAllMocks()
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
        expect(validators.id).toHaveBeenLastCalledWith('12')
        expect(validators.key_platform).toHaveBeenLastCalledWith('ios', true)
      })
  })

  test('should update key', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({'bare': 12, 'json': {'id': 12}, 'pretty': 'ios key 12 unlocked'})
        expect(pgb.api.updateKey).toBeCalledWith('ios', '12', { data: { password: 'password' } })
        expect(prompt).toHaveBeenCalledWith('Key Password: ', {'mask': true})
      })
  })

  test('should fail on winphone', (done) => {
    pgb.opts.commands = [ 'unlock', 'winphone', '12' ]
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('"winphone" signing keys are not locked'))
        done()
      })
  })

  test('should reject on error', () => {
    pgb.api.updateKey = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.key).toBeCalledWith())
  )
})
