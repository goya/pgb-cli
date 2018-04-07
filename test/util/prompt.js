const prompt = require('../../src/util/prompt')
const stdout = require('std-mocks')

describe('piped data', () => {
  let stdin

  beforeEach(() => {
    stdin = require('mock-stdin').stdin()
    stdout.use()
  })

  afterEach(() => {
    stdout.flush()
    stdin.restore()
    stdout.restore()
  })

  test('should return stdin values', (done) => {
    prompt('ok? ').then((a) => {
      expect(a).toBe('hello')
      done()
    })
    stdin.send('hello\n')
    stdin.send(null)
  })

  test('should fail if confirmation and n', (done) => {
    prompt('ok?', { confirm: true }).then((a) => {
      done.fail('valid confirmation')
    }).catch(() => done())
    stdin.send('n\n')
    stdin.end()
  })

  test('should fail on no data', (done) => {
    prompt('ok?', { confirm: true }).then((a) => {
      done.fail('valid confirmation')
    }).catch(() => done())

    stdin.send('\n')
    stdin.end()
  })

  test('should succeed if y', (done) => {
    prompt('ok?', { confirm: true })
      .then((a) => {
        done()
      })
      .catch(() => done.fail('failed confirmation'))

    stdin.send('y\n')
    stdin.end()
  })

  test('should succeed if Y', (done) => {
    prompt('ok?', { confirm: true })
      .then((a) => {
        done()
      })
      .catch(() => done.fail('failed confirmation'))

    stdin.send('Y\n')
    stdin.end()
  })

  test('should mask input if required', (done) => {
    prompt('ok?', { mask: true })
      .then((a) => {
        expect(a).toBe('password')
        done()
      })
      .catch((e) => done.fail(e))

    stdin.send('password\n')
    stdin.end()
  })

  describe('exit', () => {
    let oldExit = process.exit

    afterAll(() => { process.exit = oldExit })

    test('should exit on esc', (done) => {
      process.exit = jest.fn(() => {
        done()
      })

      prompt('ok?')
        .then(() => done.fail('failed'))
        .catch(() => done.fail('failed'))

      stdin.send('\u001b')
      stdin.end()
    })
  })
})

// '\u0003': // ctrl-c
// case '\u001b
