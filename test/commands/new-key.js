const command = require('../../src/commands/new-key')
const validators = require('../../src/commands/helpers/validators')
const fs = require('fs')
const prompt = require('../../src/util/prompt')
jest.mock('../../src/util/prompt')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('new', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'new', 'ios' ], variables: { title: 'a title', key: '/foo', profile: '/bar' } })
    fs.writeFileSync('/foo')
    fs.writeFileSync('/bar')
    pgb.api.addKey = jest.fn(() => Promise.resolve({ id: 12 }))
    prompt.mockResolvedValue('password')
    jest.clearAllMocks()
  })

  afterAll(() => {
    delete global.pgb
  })
  describe('validation', () => {
    test('should validate ios', () => {
      return Promise.resolve()
        .then(command)
        .then(() => {
          expect(validators.args).toHaveBeenLastCalledWith(1)
          expect(validators.signed_in).toBeCalled()
          expect(validators.variables).toHaveBeenLastCalledWith('title', 'key', 'profile')
        })
    })

    test('should validate android', () => {
      pgb.opts.commands = [ 'new', 'android' ]
      pgb.opts.variables = { title: 'a title', alias: 'an alias', key: '/foo' }
      return Promise.resolve()
        .then(command)
        .then(() => {
          expect(validators.args).toHaveBeenLastCalledWith(1)
          expect(validators.signed_in).toBeCalled()
          expect(validators.variables).toHaveBeenLastCalledWith('title', 'alias', 'key')
        })
    })

    test('should validate windows', () => {
      pgb.opts.commands = [ 'new', 'windows' ]
      pgb.opts.variables = { title: 'a title', key: '/foo' }
      return Promise.resolve()
        .then(command)
        .then(() => {
          expect(validators.args).toHaveBeenLastCalledWith(1)
          expect(validators.signed_in).toBeCalled()
          expect(validators.variables).toHaveBeenLastCalledWith('title', 'key')
        })
    })

    test('should validate winphone', () => {
      pgb.opts.commands = [ 'new', 'winphone' ]
      pgb.opts.variables = { title: 'a title', publisher_id: 'FD945E45-1BD2-4244-867F-4DC0B3BF0E7C' }
      return Promise.resolve()
        .then(command)
        .then(() => {
          expect(validators.args).toHaveBeenLastCalledWith(1)
          expect(validators.signed_in).toBeCalled()
          expect(validators.variables).toHaveBeenLastCalledWith('title', 'publisher_id')
        })
    })

    test('should validate winphone and throw on bad publisher_id', (done) => {
      pgb.opts.commands = [ 'new', 'winphone' ]
      pgb.opts.variables = { title: 'a title', publisher_id: 'bad' }
      return Promise.resolve()
        .then(command)
        .then(done.fail)
        .catch((e) => {
          expect(e).toMatchObject(new Error('invalid publisher id'))
          done()
        })
    })
  })

  test('should update app', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'id': 12 }, 'pretty': 'ios key 12 added' })
        let call = pgb.api.addKey.mock.calls[0]
        expect(call[0]).toBe('ios')
        expect(call[1]).toMatchObject({ cert: { path: '/foo' }, profile: { path: '/bar' }, data: { title: 'a title' } })
      })
  })

  test('should reject on error', () => {
    pgb.api.addKey = jest.fn().mockRejectedValue(new Error('an error'))
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.platform).toBeCalledWith(true))
  )
})
