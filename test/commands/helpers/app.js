const app = require('../../../src/commands/helpers/app.js')

describe('app', () => {
  beforeEach(() => {
    global.pgb = { opts: { variables: {} } }
  })

  test('should format platforms', () => {
    expect(app.getData).toBeInstanceOf(Function)
  })

  test('should return empty object with no variables', () =>
    expect(app.getData()).toEqual({ keys: {} })
  )

  test('should attach whitelisted variables to object', () => {
    global.pgb.opts.variables = { share: true, foo: 'bar', 'android-key': 12 }
    expect(app.getData()).toEqual({ share: true, keys: { android: 12 } })
  })
})
