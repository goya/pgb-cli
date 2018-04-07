const payload = require('../../../src/commands/helpers/payload')
const fs = require('fs')

describe('payload', () => {
  beforeEach(() => {
    global.pgb = jest.fn()
  })

  afterEach(() => { delete global.pgb })

  test('should validate id', () => {
    expect(payload.addFiles({})).toEqual({})

    global.pgb.opts = { variables: { foo: '/bar' } }
    expect(() => payload.addFiles({}, 'foo')).toThrow('file "/bar" not found or cannot be read - Error: ENOENT: no such file or directory, open \'/bar\'')

    fs.writeFileSync('/bar', 'data')
    expect(payload.addFiles({}, 'foo:oof')).toMatchObject({ })
    expect(payload.addFiles({}, 'zig')).toEqual({ })
  })

  test('should addVariablesaddVariables', () => {
    expect(payload.addVariables({})).toEqual({})

    global.pgb.opts = { variables: { foo: 'bar', zig: 'zag' } }
    expect(payload.addVariables({}, 'foo')).toEqual({ foo: 'bar' })
    expect(payload.addVariables({}, 'foo', 'zig')).toEqual({ foo: 'bar', zig: 'zag' })
    expect(payload.addVariables({}, 'foo:oof', 'zig:giz')).toEqual({ oof: 'bar', giz: 'zag' })
    expect(payload.addVariables({}, 'none')).toEqual({ })
  })
})
