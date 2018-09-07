const app = require('../../../src/commands/helpers/app.js')
const fs = require('fs')

describe('app', () => {
  beforeEach(() => {
    global.pgb = { opts: { variables: {} } }
  })

  test('should be a function', () => {
    expect(app.getData).toBeInstanceOf(Function)
  })

  test('should return empty object with no variables', () =>
    expect(app.getData()).toEqual({ keys: {}, ignore: [] })
  )

  test('should not fail if config file not found', () =>
    expect(app.getData('not_found')).toEqual({ keys: {}, ignore: [] })
  )

  test('should throw error on bad json', () => {
    fs.writeFileSync('/.pgbrc', 'not json')
    expect(() => app.getData('/')).toThrow('invalid json in .pgbrc file')
  })

  test('should get variables from file', () => {
    fs.writeFileSync('/.pgbrc', '{ "private": true }')
    expect(app.getData('/')).toEqual({ 'ignore': [], 'keys': {}, 'private': true })
  })

  test('should attach whitelisted variables to object', () => {
    global.pgb.opts.variables = { share: true, foo: 'bar', 'android-key': 12, ignore: [ 'node_modules' ] }
    expect(app.getData()).toEqual({ share: true, keys: { android: 12 }, ignore: [ 'node_modules' ] })
  })
})
