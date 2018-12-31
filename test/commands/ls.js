const command = require('../../src/commands/ls')
const validators = require('../../src/commands/helpers/validators')

describe('ls', () => {
  let apps

  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'ls' ] })
    apps = { apps: [
      { id: 1, title: '123456789012345678901234567890', status: { ios: 'error', android: 'skip', winphone: 'pending' }, last_build: '4 march 1994', foo: 'bar', zig: null },
      { id: 12, status: { ios: 'error', android: 'unknown', winphone: 'complete' }, foo: { a: 12 } }
    ] }
    pgb.api.getApps = jest.fn(() => Promise.resolve(apps))
    process.stdout.columns = 10
  })

  afterAll(() => {
    delete global.pgb
    process.stdout.columns = 10
  })

  test('should validate', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(validators.signed_in).toHaveBeenCalled()
      })
  })

  test('should print apps details', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        let call = pgb.print.mock.calls[0]
        expect(call[0].pretty).toMatch(/App Id[^]*1[^]*123456789012\.\.\.[^]*FAILED[^]*SKIPPED[^]*BUILDING[^]*1994-03-04[^]*12[^]*FAILED[^]*BUILDING[^]*SUCCESS/)
        expect(call[0].json).toEqual(apps)
        expect(call[0].bare).toEqual('1\n12')
        expect(pgb.api.getApps).toHaveBeenCalled()
      })
  })

  test('should print apps details even when not stdout.tty', () => {
    process.stdout.columns = undefined
    return Promise.resolve()
      .then(command)
      .then(() => {
        let call = pgb.print.mock.calls[0]
        expect(call[0].pretty).toMatch(/App Id[^]*1[^]*123456789012345678901234567890[^]*FAILED[^]*SKIPPED[^]*BUILDING[^]*1994-03-04[^]*12[^]*FAILED[^]*BUILDING[^]*SUCCESS/)
        expect(call[0].json).toEqual(apps)
        expect(call[0].bare).toEqual('1\n12')
        expect(pgb.api.getApps).toHaveBeenCalled()
      })
  })

  test('should truncate properly if no tty', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        let call = pgb.print.mock.calls[0]
        expect(call[0].pretty).toMatch(/App Id[^]*1[^]*FAILED[^]*SKIPPED[^]*BUILDING[^]*1994-03-04[^]*12[^]*FAILED[^]*BUILDING[^]*SUCCESS/)
        expect(call[0].json).toEqual(apps)
        expect(call[0].bare).toEqual('1\n12')
        expect(pgb.api.getApps).toHaveBeenCalled()
      })
  })

  test('should print no apps if no apps', () => {
    pgb.api.getApps = jest.fn(() => Promise.resolve({ apps: [ ] }))
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toHaveBeenLastCalledWith({ 'bare': '', 'json': { 'apps': [] }, 'pretty': '\nno apps\n' })
        expect(pgb.api.getApps).toHaveBeenCalled()
      })
  })

  test('should allow column override', () => {
    pgb.opts.commands.push('foo')
    pgb.opts.commands.push('zig')
    pgb.api.getApps = jest.fn(() => Promise.resolve(apps))
    return Promise.resolve()
      .then(command)
      .then(() => {
        let call = pgb.print.mock.calls[0]
        expect(call[0].pretty).toMatch(/App Id[^]*Title[^]*Foo[^]*Zig[^]*1[^]*bar[^]*12[^]*{ a: 12 }/)
        expect(call[0].json).toEqual(apps)
        expect(call[0].bare).toEqual('1\n12')
        expect(pgb.api.getApps).toHaveBeenCalled()
      })
  })

  test('should reject on error', (done) => {
    pgb.api.getApps = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
        done()
      })
  })
})
