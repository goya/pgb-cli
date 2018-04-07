const colours = require('../../src/util/colours')

describe('colours', () => {
  test('should be an object', () =>
    expect(colours).toBeInstanceOf(Object)
  )

  test('should create keys from colour set', () =>
    expect(Object.keys(colours)).toHaveLength(8)
  )

  test('should have aliases', () => {
    expect(colours.default).not.toBeUndefined()
    expect(colours.debug).not.toBeUndefined()
    expect(colours.done).not.toBeUndefined()
    expect(colours.bold).not.toBeUndefined()
    expect(colours.error).not.toBeUndefined()
    expect(colours.header).not.toBeUndefined()
    expect(colours.pending).not.toBeUndefined()
    expect(colours.disabled).not.toBeUndefined()
  })

  test('should return a colour coded string', () => {
    expect(colours.bold('foo')).toBe('\x1B[1mfoo\x1B[0m')
  })

  test('should not colour code if disabled', () => {
    colours.disabled = true
    expect(colours.bold('foo')).not.toBe('\x1B[1mfoo\x1B[0m')
  })
})
