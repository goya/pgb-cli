const validators = require('../../../src/commands/helpers/validators')

describe('validators', () => {
  beforeEach(() => {
    require('../../_helpers/pgb')()
  })

  afterEach(() => { delete global.pgb })

  test('should validate id', () => {
    expect(validators.id('1')).toBe('1')
    expect(() => validators.id('foo')).toThrow('"foo" is not a valid id')
    expect(() => validators.id(null)).toThrow('"null" is not a valid id')
  })

  test('should validate signed in', () => {
    global.pgb.api = { hasAuth: () => true }
    expect(() => validators.signed_in()).not.toThrow()

    global.pgb.api = { hasAuth: () => false }
    expect(() => validators.signed_in()).toThrow('not signed-in')
  })

  test('should validate platform', () => {
    expect(validators.platform('', false)).toBe('')
    expect(validators.platform('ios', false)).toBe('ios')
    expect(validators.platform('android', false)).toBe('android')
    expect(validators.platform('windows', false)).toBe('winphone')
    expect(validators.platform('winphone', false)).toBe('winphone')
    expect(() => validators.platform('foo', false)).toThrow('"foo" is not a supported platform (ios,android,windows)')
    expect(() => validators.platform('', true)).toThrow('no platform specified')
  })

  test('should validate key_platform', () => {
    expect(validators.key_platform('', false)).toBe('')
    expect(validators.key_platform('ios', false)).toBe('ios')
    expect(validators.key_platform('android', false)).toBe('android')
    expect(validators.key_platform('windows', false)).toBe('windows')
    expect(validators.key_platform('winphone', false)).toBe('winphone')
    expect(() => validators.key_platform('foo', false)).toThrow('"foo" is not a supported platform (ios,android,windows,winphone)')
    expect(() => validators.key_platform('', true)).toThrow('no platform specified')
  })

  test('should validate args', () => {
    pgb.opts = { commands: ['cmd'] }

    jest.mock('../../../src/commands/usage')
    expect(pgb.opts.short_usage).toBeFalsy()
    expect(() => validators.args(1)).toThrow('')
    expect(pgb.error).lastCalledWith('command requires 1 argument(s)')
    expect(pgb.opts.short_usage).toBeTruthy()
    pgb.opts = { commands: ['cmd', 'arg1'] }
    expect(() => validators.args(1)).not.toThrow()
    pgb.opts = { commands: ['cmd', 'arg1', 'arg2'] }
    expect(() => validators.args(2)).not.toThrow()
  })

  test('should validate variables', () => {
    pgb.opts = { variables: { foo: 'bar' } }

    expect(() => validators.variables('foo')).not.toThrow()
    expect(() => validators.variables('zig')).toThrow('missing value(s) for "zig"')
    expect(() => validators.variables('zig', 'foo')).toThrow('missing value(s) for "zig"')
    expect(() => validators.variables('zig', 'foo', 'zag')).toThrow('missing value(s) for "zig", "zag"')
  })
})
