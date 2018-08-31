const key = require('../../../src/commands/helpers/unlock-key.js')
const prompt = require('../../../src/util/prompt')
jest.mock('../../../src/util/prompt')
const stdout = require('std-mocks')
global.pgb = { opts: { variables: {} } }

describe('key', () => {
  beforeEach(() => {
    prompt.mockReturnValue(Promise.resolve('input'))
    stdout.use()
    global.pgb = { opts: { variables: {} } }
  })

  afterEach(() => {
    stdout.flush()
    stdout.restore()
  })

  test('should format platforms', () => {
    expect(key).toBeInstanceOf(Function)
  })

  test('should use variables for android', () => {
    global.pgb = { opts: { variables: { keystore_password: 'abcd', key_password: 'efgh' } } }
    return key('android')
      .then((key) => {
        expect(prompt).not.toHaveBeenCalled()
        expect(stdout.flush().stdout).toEqual([])
      })
  })

  test('should use variables for ios/winphone', () => {
    global.pgb = { opts: { variables: { key_password: 'abcd' } } }
    return key('ios')
      .then((key) => {
        expect(prompt).not.toHaveBeenCalled()
        expect(key).toEqual({ 'password': 'abcd' })
        expect(stdout.flush().stdout).toEqual([])
      })
  })

  test('should prompt for ios/winphone', () => {
    global.pgb = { opts: { variables: { } } }
    return key('ios')
      .then((data) => {
        expect(data).toEqual({ 'password': 'input' })
        expect(prompt).toHaveBeenLastCalledWith('Key Password: ', { mask: true })
      })
  })

  test('should prompt for android', () => {
    global.pgb = { opts: { variables: { } } }
    return key('android')
      .then((key) => {
        expect(key).toEqual({ 'keystore_pw': 'input', 'key_pw': 'input' })
        expect(prompt).toHaveBeenCalledWith('Key Password: ', { mask: true })
        expect(prompt).toHaveBeenCalledWith('Keystore Password: ', { mask: true })
      })
  })
})
