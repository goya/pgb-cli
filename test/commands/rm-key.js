const command = require('../../src/commands/rm-key')
const validators = require('../../src/commands/helpers/validators')
const prompt = require('../../src/util/prompt')
jest.mock('../../src/util/prompt')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('rm', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'rm-key', 'ios', '12' ] })
    pgb.api.deleteKey = jest.fn(() => Promise.resolve())
    prompt.mockResolvedValue('y')
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

  test('should delete app with no prompt if forced', () => {
    pgb.opts.force = true
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({'bare': '12', 'pretty': 'ios key 12 deleted'})
        expect(pgb.api.deleteKey).toBeCalledWith('ios', '12')
        expect(prompt).not.toHaveBeenCalled()
      })
  })

  test('should delete app if confirmed', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({'bare': '12', 'pretty': 'ios key 12 deleted'})
        expect(pgb.api.deleteKey).toBeCalledWith('ios', '12')
        expect(prompt).toHaveBeenCalledWith('are you sure? [yN] ', {confirm: true})
      })
  })

  test('should not delete app if not confirmed', (done) => {
    prompt.mockRejectedValue()
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch(() => {
        expect(pgb.print).not.toBeCalled()
        expect(pgb.api.deleteKey).not.toBeCalled()
        expect(prompt).toHaveBeenCalledWith('are you sure? [yN] ', {confirm: true})
        done()
      })
  })

  test('should reject on error', () => {
    pgb.api.deleteApp = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.key).toBeCalledWith(true))
  )
})
