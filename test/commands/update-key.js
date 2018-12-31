const command = require('../../src/commands/update-key')
const validators = require('../../src/commands/helpers/validators')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('update', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'update-key', 'ios', '12' ], variables: { title: 'a title' } })
    pgb.api.updateKey = jest.fn(() => Promise.resolve({ id: 12 }))
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
        expect(validators.signed_in).toHaveBeenCalled()
        expect(validators.id).toHaveBeenLastCalledWith('12')
        expect(validators.key_platform).toHaveBeenLastCalledWith('ios', true)
      })
  })

  test('should update app', () => {
    pgb.opts.force = true
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toHaveBeenCalledWith({ 'bare': 12, 'json': { 'id': 12 }, 'pretty': 'ios key 12 updated' })
        expect(pgb.api.updateKey).toHaveBeenCalledWith('ios', '12', { 'title': 'a title' })
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
      .then(() => expect(complete.key).toHaveBeenCalledWith(true))
  )
})
