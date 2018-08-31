const version = require('../package.json').version
const util = require('util')
const parseArgs = require('../src/util/args')
jest.mock('../src/util/args')

describe('index', () => {
  beforeAll(() => {
    global.pgb = require('../src/index')()
    jest.spyOn(process, 'exit').mockResolvedValue(true)
    parseArgs.mockResolvedValue({ 'commands': ['command'], 'variables': {} })
  })

  beforeEach(() => {
    pgb.opts = { }
  })

  afterAll(() => {
    process.exit.mockRestore()
  })

  test('should export a function', () =>
    expect(pgb.run).toBeInstanceOf(Function)
  )

  test('should init api with user agent and process eventEmitter', () => {
    expect(global.pgb.api.defaults.headers).toEqual(
      { 'User-Agent': `pgb-cli/${version} node/${process.version} (${process.platform})` }
    )
    expect(global.pgb.api.defaults.events).toBe(process)
  })

  describe('run', () => {
    beforeEach(() => {
      jest.spyOn(pgb, 'handleError').mockResolvedValue({})
      jest.spyOn(pgb, 'runCommand').mockResolvedValue({})
    })

    afterEach(() => {
      pgb.runCommand.mockRestore()
      pgb.handleError.mockRestore()
    })

    test('should parse and call command', () => {
      return pgb.run().then(() => {
        expect(parseArgs).toHaveBeenLastCalledWith(pgb.cliOpts)
        expect(pgb.runCommand).toHaveBeenLastCalledWith({ variables: {}, commands: [ 'command' ] })
        expect(pgb.handleError).not.toBeCalled()
      })
    })

    test('should handle error if the command is rejected', () => {
      jest.spyOn(pgb, 'runCommand').mockImplementation(() => Promise.reject(new Error('an error')))
      let pgb_runCommand = pgb.runCommand
      return pgb.run().then(() => {
        expect(parseArgs).toHaveBeenLastCalledWith(pgb.cliOpts)
        expect(pgb_runCommand).toHaveBeenLastCalledWith({ variables: {}, commands: [ 'command' ] })
        expect(pgb.handleError).toHaveBeenLastCalledWith(new Error('an error'))
      })
    })
  })

  describe('runCommand', () => {
    beforeAll(() => {
      jest.spyOn(pgb.session, 'load').mockReturnValue({ authtoken: '123' })
      jest.spyOn(pgb, 'debug')

      jest.mock('../src/commands/usage')
      let usage = require('../src/commands/usage')
      usage.mockResolvedValue('usage')

      jest.mock('../src/commands/whoami')
      let whoami = require('../src/commands/whoami')
      whoami.mockResolvedValue('whoami')

      jest.mock('../src/commands/version')
      let version = require('../src/commands/version')
      version.mockResolvedValue('version')

      jest.mock('../src/commands/completion')
      let completion = require('../src/commands/completion')
      completion.mockResolvedValue('completion')
      jest.spyOn(process, 'on')
    })

    afterAll(() => {
      pgb.session.load.mockRestore()
      pgb.debug.mockRestore()
      process.on.mockRestore()
    })

    test('should update pgb object', () => {
      return pgb.runCommand({ commands: ['foo'], variables: {} })
        .then(() => {
          expect(pgb.api.defaults.headers).toMatchObject({ 'Authorization': 'token 123' })
          expect(pgb.opts.commands).toEqual(['foo'])
          expect(pgb.colours.disabled).toBeFalsy()
        })
    })

    test('should disable colours on nocolours', () => {
      return pgb.runCommand({ commands: ['foo'], nocolours: true, variables: {} })
        .then(() => {
          expect(pgb.colours.disabled).toBeTruthy()
        })
    })

    test('should default to usage if no command given', () => {
      return pgb.runCommand({ commands: [], variables: {} })
        .then((cmd) => {
          expect(cmd).toBe('usage')
        })
    })

    test('should default to usage if help set', () => {
      return pgb.runCommand({ commands: ['whoami'], help: true, variables: {} })
        .then((cmd) => {
          expect(cmd).toBe('usage')
        })
    })

    test('should default to usage if illegal command', () => {
      return pgb.runCommand({ commands: ['../illegal'], variables: {} })
        .then((cmd) => {
          expect(cmd).toBe('usage')
        })
    })

    test('should execute command if found', () => {
      return pgb.runCommand({ commands: ['whoami'], variables: {} })
        .then((cmd) => {
          expect(cmd).toBe('whoami')
        })
    })

    test('should show version if version set', () => {
      return pgb.runCommand({ commands: ['whoami'], version: true, variables: {} })
        .then((cmd) => {
          expect(cmd).toBe('version')
        })
    })

    test('should show completion if completion set', () => {
      return pgb.runCommand({ commands: ['whoami'], completion: true, variables: {} })
        .then((cmd) => {
          expect(cmd).toBe('completion')
        })
    })

    test('should pipe debug event to pgb.debug', () => {
      return pgb.runCommand({ commands: [''], variables: {} })
        .then((cmd) => {
          process.emit('debug', 'foo')
          expect(pgb.debug).toHaveBeenLastCalledWith('foo')
        })
    })
  })

  describe('handleError', () => {
    beforeEach(() => {
      jest.spyOn(pgb, 'error').mockReturnValue()
    })

    afterEach(() => {
      pgb.error.mockRestore()
    })

    test('should handle 401', () => {
      pgb.handleError({ statusCode: 401 })
      expect(pgb.error).toHaveBeenLastCalledWith('not signed in')
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('should handle api errors', () => {
      pgb.handleError({ error: 'foo' })
      expect(pgb.error).toHaveBeenLastCalledWith('foo')
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('should handle error objects', () => {
      pgb.handleError(new Error('foo'))
      expect(pgb.error).toHaveBeenLastCalledWith('foo')
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('should not print anything if no message', () => {
      pgb.handleError(new Error())
      expect(pgb.error).not.toHaveBeenLastCalledWith()
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('should not print anything if null', () => {
      pgb.handleError(null)
      expect(pgb.error).not.toHaveBeenLastCalledWith()
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('should handle ENOENT', () => {
      let err = new Error('access denied')
      err.code = 'ENOENT'
      err.path = '/foo/bar'
      pgb.handleError(err)
      expect(pgb.error).toHaveBeenLastCalledWith('file or directory not found: /foo/bar')
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('Should handle EACCES', () => {
      let err = new Error('access error')
      err.code = 'EACCES'
      err.path = '/foo/bar'
      pgb.handleError(err)
      expect(pgb.error).toHaveBeenLastCalledWith('file or directory cannot be opened: /foo/bar')
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('Should handle ENOTDIR', () => {
      let err = new Error('access error')
      err.code = 'ENOTDIR'
      err.path = '/foo/bar'
      pgb.handleError(err)
      expect(pgb.error).toHaveBeenLastCalledWith('directory cannot be created: /foo/bar')
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })

    test('otherwise should just echo error', () => {
      pgb.handleError('foo')
      expect(pgb.error).toHaveBeenLastCalledWith('foo')
      expect(process.exit).toHaveBeenLastCalledWith(1)
    })
  })

  describe('htmlDecode', () => {
    test('should decode common html encoded codes', () => {
      expect(pgb.htmlDecode('')).toEqual('')
      expect(pgb.htmlDecode('&lt;&gt;&quot;&#39;&amp;')).toEqual('<>"\'&')
    })
  })

  describe('console functions', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => true)
      jest.spyOn(console, 'log').mockImplementation(() => true)
    })
    afterEach(() => {
      console.error.mockRestore()
      console.log.mockRestore()
    })

    describe('pgb.error', () => {
      test('should decode common html encoded codes', () => {
        pgb.error('foo')
        expect(console.error).toHaveBeenLastCalledWith(pgb.colours.error('foo'))
      })
    })

    describe('pgb.debug', () => {
      test('should not print if debug is false', () => {
        pgb.opts = { }
        console.error('foo')
        pgb.debug('bar')
        expect(console.error).toHaveBeenLastCalledWith('foo')
      })

      test('should inspect object and pretty print', () => {
        pgb.opts = { debug: true }
        pgb.debug({ foo: 'bar' })
        expect(console.error).toHaveBeenLastCalledWith(pgb.colours.debug('{ foo: \'bar\' }'))
      })

      test('should dump json if requested', () => {
        pgb.opts = { debug: true }
        pgb.debug('foo')
        expect(console.error).toHaveBeenLastCalledWith(pgb.colours.debug('foo'))
      })
    })

    describe('pgb.print', () => {
      test('should dump string', () => {
        pgb.print('foo')
        expect(console.log).toHaveBeenLastCalledWith('foo')
        pgb.print({ pretty: 'foo' })
        expect(console.log).toHaveBeenLastCalledWith('foo')
      })

      test('should dump json string if requested', () => {
        pgb.opts.json = true
        pgb.print({ pretty: 'foo', json: { foo: 'bar' }, bare: 1 })
        expect(console.log).toHaveBeenLastCalledWith('{"foo":"bar"}')
      })

      test('should not print if values are null', () => {
        pgb.opts.json = true
        pgb.print({ })
        pgb.opts.bare = true
        pgb.opts.json = false
        pgb.print({ })
        pgb.opts.json = false
        pgb.opts.bare = false
        pgb.print({})
        expect(console.log).not.toBeCalled()
      })

      test('should print bare', () => {
        pgb.opts.bare = true
        pgb.print({ pretty: 'foo', json: { foo: 'bar' }, bare: 1 })
        expect(console.log).toHaveBeenLastCalledWith(1)
      })

      test('should inspect if pretty is an object', () => {
        pgb.opts.json = false
        pgb.print({ pretty: { foo: 'bar' }, json: { foo: 'bar' }, bare: 1 })
        expect(console.log).toHaveBeenLastCalledWith(util.inspect({ foo: 'bar' }, { colors: true }))
      })
    })
  })
})
