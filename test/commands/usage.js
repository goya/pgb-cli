const usage = require('../../src/commands/usage')
const fs = require('fs')

describe('usage', () => {
  beforeEach(() => {
    require('../_helpers/pgb')()
    fs.readFileSync = jest.fn(() => 'foo bar\nzig\nzag')
  })

  afterEach(() => {
    delete global.pgb
  })

  test('should return usage if found', () => {
    global.pgb.opts = { commands: [ ] }
    fs.existsSync = jest.fn(() => true)
    return Promise.resolve()
      .then(usage)
      .then(() => expect(pgb.print).toHaveBeenLastCalledWith('foo bar\nzig\nzag'))
  })

  test('should show error and return default usage if found', () => {
    global.pgb.opts = { commands: [ 'foo' ] }
    fs.existsSync = jest.fn(() => false)
    return Promise.resolve()
      .then(usage)
      .then(() => expect(pgb.error).toHaveBeenLastCalledWith('unkown command \'foo\''))
      .then(() => expect(pgb.print).toHaveBeenLastCalledWith('foo bar\nzig\nzag'))
  })

  test('should show short usage if flagged', () => {
    global.pgb.opts = { commands: [ ], short_usage: true }
    global.pgb.colours = { info: (a) => a + '' }
    fs.readFileSync = jest.fn(() => 'foo bar\nzg\nzag')
    return Promise.resolve()
      .then(usage)
      .then(() => expect(pgb.print).toHaveBeenLastCalledWith('foo bar'))
  })
})
