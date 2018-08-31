const command = require('../../src/commands/keys')
const validators = require('../../src/commands/helpers/validators')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('keys', () => {
  let keys

  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'keys' ] })
    keys = { keys: { ios: { all: [
      { id: 12, created_at: 'March 4, 1994', locked: true },
      { id: 12, default: true, last_used: 'March 4, 1994', created_at: 'March 4, 1994' }
    ] },
    android: { all: [
      { id: 12, created_at: 'March 4, 1994' }
    ] },
    windows: { all: [] },
    winphone: { all: [
      { id: 12, created_at: 'March 4, 1994' }
    ] } } }
    pgb.api.getKeys = jest.fn(() => Promise.resolve(keys))
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should validate', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(validators.signed_in).toBeCalled()
        expect(validators.key_platform).toHaveBeenLastCalledWith(undefined, false)
      })
  })

  test('should print keys', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        let call = pgb.print.mock.calls[0]
        expect(call[0].pretty).toMatch(/Platform:[^]*ios[^]*12[^]*LOCKED[^]*NEVER[^]*1994-03-04[^]*Platform:[^]*android[^]*12[^]*Platform:[^]*windows[^]*no keys[^]*Platform:[^]*winphone[^]*12/)
        expect(pgb.api.getKeys).toHaveBeenLastCalledWith('')
      })
  })

  test('should print no keys if no keys', () => {
    keys = { keys: { ios: { all: [] }, android: { all: [] }, windows: { all: [] }, winphone: { all: [] } } }
    return Promise.resolve()
      .then(command)
      .then(() => {
        let call = pgb.print.mock.calls[0]
        expect(call[0].pretty).toMatch(/Platform:[^]*ios[^]*no keys[^]*Platform:[^]*android[^]*no keys[^]*Platform:[^]*windows[^]*no keys[^]*Platform:[^]*winphone[^]*no keys/)
        expect(call[0].json).toEqual({ 'keys': { 'android': { 'all': [] }, 'ios': { 'all': [] }, 'windows': { 'all': [] }, 'winphone': { 'all': [] } } })
        expect(call[0].bare).toEqual('')
        expect(pgb.api.getKeys).toHaveBeenLastCalledWith('')
      })
  })

  test('should print a single platform', () => {
    pgb.opts.commands.push('ios')
    pgb.api.getKeys = jest.fn(() => Promise.resolve({ keys: [] }))
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toHaveBeenLastCalledWith({ 'bare': '', 'json': { 'keys': [] }, 'pretty': '\nPlatform: ios\n\nno keys\n' })
        expect(pgb.api.getKeys).toHaveBeenLastCalledWith('ios')
      })
  })

  test('should reject on error', (done) => {
    pgb.api.getKeys = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
        done()
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.platform).toBeCalledWith(true))
  )
})
