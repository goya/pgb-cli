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
    let opts = { flags: {}, aliases: {}, variables: {} }
    process.argv = [ '', '' ]
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ ], variables: {} })
    })
  })

  test('should parse single commands', () => {
    let opts = { flags: {}, aliases: {}, variables: {} }
    argv('foo')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: {} })
    })
  })

  test('should parse multiple commands', () => {
    let opts = { flags: {}, aliases: {}, variables: {} }
    argv('foo bar')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo', 'bar' ], variables: {} })
    })
  })

  test('should parse flags', () => {
    let opts = { flags: { foo: 'b' }, aliases: {}, variables: {} }
    argv('foo -b')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], foo: true, variables: {} })
    })
  })

  test('should parse flags with multiple aliases', () => {
    let opts = { flags: { foo: 'br' }, aliases: {}, variables: {} }
    argv('foo -r')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], foo: true, variables: {} })
    })
  })

  test('should parse compound flags', () => {
    let opts = { flags: { bar: 'x', roo: 'r' }, aliases: {}, variables: {} }
    argv('foo -xr')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], bar: true, roo: true, variables: {} })
    })
  })

  test('should parse full flags', () => {
    let opts = { flags: { bar: 'x', roo: 'y', oot: 'z' }, aliases: {}, variables: {} }
    argv('foo --bar --roo')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], bar: true, roo: true, variables: {} })
    })
  })

  test('should parse variables only with --blah or blah=blah', () => {
    let opts = { flags: {}, aliases: {}, variables: { lock: false, foo: false } }
    argv('foo lock 12 --lock b yut=9 foo bar')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: ['foo', 'lock', '12', 'foo', 'bar'], variables: { lock: 'b', yut: '9' } })
    })
  })

  test('should parse variables', () => {
    let opts = { flags: {}, aliases: {}, variables: {} }
    argv('foo var1=abc var2=def')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc', var2: 'def' } })
    })
  })

  test('should parse variables with dashes in name', () => {
    let opts = { flags: { 'exitcode': '' }, aliases: {}, variables: { } }
    argv('foo --exit-code')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], exitcode: true, variables: { } })
    })
  })

  test('should parse variables correctly with equal signs in value', () => {
    let opts = { flags: { }, aliases: {}, variables: { var1: false } }
    argv('foo var1=abc var2=bar=12')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc', var2: 'bar=12' } })
    })
  })

  test('should parse variables correctly with --', () => {
    let opts = { flags: { }, aliases: {}, variables: { var2: false } }
    argv('foo var1=abc --var2 bar=12')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc', var2: 'bar=12' } })
    })
  })

  test('should parse variables correctly with -- and equal signs', () => {
    let opts = { flags: { }, aliases: {}, variables: { var2: false } }
    argv('foo var1=abc --var2=bar=12 --var3=12')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc', var2: 'bar=12', 'var3': '12' } })
    })
  })

  test('should handle a dangling multiple variable without error', () => {
    let opts = { flags: { }, aliases: {}, variables: { var1: true } }
    argv('foo --var1')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: [''] } })
    })
  })

  test('should handle a dangling variable without error', () => {
    let opts = { flags: { }, aliases: {}, variables: { var1: false } }
    argv('foo --var1')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: undefined } })
    })
  })

  test('should parse variables and use arrays for duplicate variables', () => {
    let opts = { flags: { }, aliases: {}, variables: { var2: true, var4: true } }
    argv('foo var1=abc --var2=bar=12 --var3=12 --var2=bar=24 --var3=24 --var4=1,2,3')
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc', var2: ['bar=12', 'bar=24'], 'var3': '24', 'var4': ['1', '2', '3'] } })
    })
  })

  test('should include env variables with pgb_ prefix', () => {
    let opts = { flags: { }, aliases: {}, variables: {} }
    argv('foo')
    process.env['pgb_var1'] = 'abc'
    return parseArgs(opts).then((result) => {
      expect(result).toEqual({ commands: [ 'foo' ], variables: { var1: 'abc' } })
    })
  })

  test('should obey precedence, variables > envs', () => {
    let opts = { flags: { }, aliases: {}, variables: {} }
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
      let opts = { flags: { }, aliases: {}, variables: {} }
      argv('foo')
      parseArgs(opts).then((result) => {
        expect(result).toEqual({ commands: [ 'foo' ], variables: { foo: 'bar' } })
        done()
      }).catch(done.fail)

      stdin.send('{"foo": "bar"}')
      stdin.end()
    })

    test('should allow empty input', (done) => {
      let opts = { flags: { }, aliases: {}, variables: {} }
      argv('foo')
      parseArgs(opts).then((result) => {
        expect(result).toEqual({ commands: [ 'foo' ], variables: { } })
        done()
      }).catch(done.fail)

      stdin.send('')
      stdin.end()
    })

    test('should fail on bad json', (done) => {
      let opts = { flags: { }, aliases: {}, variables: {} }
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
      let opts = { flags: { }, aliases: {}, variables: {} }
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
