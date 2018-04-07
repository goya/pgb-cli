const command = require('../../src/commands/phonegaps')

describe('log', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: ['log', '12', 'ios'] })
    pgb.api.currentSupport = jest.fn(() => Promise.resolve(
      {
        default: 'foo',
        by_phonegap: { 'foo': { }, 'bar': { } }
      }
    ))
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should print log', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        let call = pgb.print.mock.calls[0]
        expect(call[0]).toMatch(/Default:[^]*foo[^]*bar[^]*foo/m)
        expect(call[1]).toEqual({'by_phonegap': {'bar': {}, 'foo': {}}, 'default': 'foo'})
        expect(pgb.api.currentSupport).toHaveBeenCalled()
      })
  })

  test('should reject on error', () => {
    pgb.api.currentSupport = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })
})
