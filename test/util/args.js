const parseArgs = require('../../src/util/args')

const argv = (str) => { process.argv = ['', ''].concat(str.split(' ')) }

afterEach(() => {
  delete process.env.pgb_var1
})

describe('args', () => {
  test('is a function', () => {
    expect(parseArgs).toBeInstanceOf(Function)
  })

  test('should return an object', () => {
    let opts = { flags: {}, aliases: {} }
    process.argv = [ '', '' ]
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ ], variables: {} })
    })
  })

  test('should parse single commands', () => {
    let opts = { flags: {}, aliases: {} }
    argv('foo')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: {} })
    })
  })

  test('should parse multiple commands', () => {
    let opts = { flags: {}, aliases: {} }
    argv('foo bar')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo', 'bar' ], variables: {} })
    })
  })

  test('should parse flags', () => {
    let opts = { flags: { foo: 'b' }, aliases: {} }
    argv('foo -b')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], foo: true, variables: {} })
    })
  })

  test('should parse flags with multiple aliases', () => {
    let opts = { flags: { foo: 'br' }, aliases: {} }
    argv('foo -r')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], foo: true, variables: {} })
    })
  })

  test('should parse compound flags', () => {
    let opts = { flags: { bar: 'x', roo: 'r' }, aliases: {} }
    argv('foo -xr')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], bar: true, roo: true, variables: {} })
    })
  })

  test('should parse full flags', () => {
    let opts = { flags: { bar: 'x', roo: 'y', oot: 'z' }, aliases: {} }
    argv('foo --bar --roo')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], bar: true, roo: true, variables: {} })
    })
  })

  test('should parse variables', () => {
    let opts = { flags: { }, aliases: {} }
    argv('foo var1=abc var2=def')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc', var2: 'def' } })
    })
  })

  test('should parse variables correctly with equal signs in value', () => {
    let opts = { flags: { }, aliases: {} }
    argv('foo var1=abc var2=bar=12')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc', var2: 'bar=12' } })
    })
  })

  test('should include env variables with pgb_ prefix', () => {
    let opts = { flags: { }, aliases: {} }
    argv('foo')
    process.env['pgb_var1'] = 'abc'
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc' } })
    })
  })

  test('should obey precedence, variables > envs', () => {
    let opts = { flags: { }, aliases: {} }
    argv('foo var1=bar')
    process.env['pgb_var1'] = 'foo'
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'bar' } })
    })
  })

  describe('piped data', () => {
    let stdin

    beforeAll(() => { stdin = require('mock-stdin').stdin() })
    beforeEach(() => stdin.reset())
    afterAll(() => stdin.restore())

    test('should parse piped data', (done) => {
      let opts = { flags: { }, aliases: {} }
      argv('foo')
      parseArgs(opts).then((result) => {
        expect(result).toEqual({ commands: [ 'foo' ], variables: { foo: 'bar' } })
        done()
      }).catch(done.fail)

      stdin.send('{"foo": "bar"}')
      stdin.end()
    })

    test('should allow empty input', (done) => {
      let opts = { flags: { }, aliases: {} }
      argv('foo')
      parseArgs(opts).then((result) => {
        expect(result).toEqual({ commands: [ 'foo' ], variables: { } })
        done()
      }).catch(done.fail)

      stdin.send('')
      stdin.end()
    })

    test('should fail on bad json', (done) => {
      let opts = { flags: { }, aliases: {} }
      argv('foo')
      parseArgs(opts).then((result) => {
        done.fail('pipe successful')
      }).catch((e) => {
        expect(e).toEqual(new Error('piped data is invalid json'))
        done()
      })

      stdin.send('not json')
      stdin.end()
    })

    test('should obey precedence, variables > pipe > envs', (done) => {
      let opts = { flags: { }, aliases: {} }
      process.env['pgb_var1'] = 'foo'
      parseArgs(opts).then((result) => {
        expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'yut' } })
      }).then(done)
        .catch(done.fail)

      stdin.send('{"var1": "yut"}')
      stdin.end()
    })
  })
})
