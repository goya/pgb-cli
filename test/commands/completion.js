const command = require('../../src/commands/completion')
const fs = require('fs')

describe('build', () => {
  beforeEach(() => {
    require('../_helpers/pgb')()
    fs.readdirSync = jest.fn(() => ['foobar.js', 'completion.js', 'usage.js', 'zigzag'])
    console.log = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete global.pgb
  })

  test('should return all commands if idx == 0', (done) => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(console.log).toHaveBeenCalledWith('foobar')
        done()
      })
      .catch(done.fail)
  })

  test('should require and call completion on command', () => {
    pgb.opts.commands = [ 'key' ]
    pgb.opts.variables.idx = 1
    process.argv = [ '', 'pgb', 'key' ]
    jest.mock('../../src/commands/key')
    let key = require('../../src/commands/key')
    key.completion = () => { return [ 'foo', 'bar' ] }
    fs.existsSync = jest.fn(() => true)
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(console.log).toHaveBeenCalledWith('foo\nbar')
      })
  })

  test('should complete with \'\' if no return value', () => {
    pgb.opts.commands = [ 'key' ]
    pgb.opts.variables.idx = 1
    process.argv = [ '', 'pgb', 'key' ]
    jest.mock('../../src/commands/key')
    let key = require('../../src/commands/key')
    key.completion = () => { }
    fs.existsSync = jest.fn(() => true)
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(console.log).toHaveBeenCalledWith('')
      })
  })

  test('should debug if error', () => {
    pgb.opts.commands = [ 'key' ]
    pgb.opts.variables.idx = 1
    process.argv = [ '', 'pgb', 'key' ]
    jest.mock('../../src/commands/key')
    let key = require('../../src/commands/key')
    key.completion = jest.fn().mockRejectedValue(new Error('an error'))
    fs.existsSync = jest.fn(() => true)
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(console.log).not.toHaveBeenCalledWith('')
        expect(pgb.debug).toBeCalledWith(new Error('an error'))
      })
  })

  test('should not complete after pipe', () => {
    pgb.opts.commands = [ 'key' ]
    pgb.opts.variables.idx = 2
    process.argv = [ '', 'pgb', 'key', '&>2' ]
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(console.log).not.toHaveBeenCalledWith('')
      })
  })

  test('should ignore flags when computing idx of word', () => {
    pgb.opts.commands = [ 'key' ]
    pgb.opts.variables.idx = 3
    process.argv = [ '', 'pgb', '-f', '-u', 'key' ]
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.opts.idx).toBe(1)
      })
  })

  test('should not do anything if no matches', () => {
    pgb.opts.commands = [ 'key' ]
    pgb.opts.variables.idx = 1
    process.argv = [ '', 'pgb', 'key' ]
    jest.mock('../../src/commands/key')
    let key = require('../../src/commands/key')
    key.completion = () => { }
    fs.existsSync = jest.fn(() => false)
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(console.log).not.toHaveBeenCalled()
      })
  })

  test('should not reject on error', () => {
    fs.readdirSync = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
  })
})
