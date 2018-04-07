const command = require('../../src/commands/download')
const validators = require('../../src/commands/helpers/validators')
const Progress = require('../../src/util/progress')
jest.mock('../../src/util/progress')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('download', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'download', '12', 'ios' ] })
    pgb.api.downloadApp = jest.fn(() => Promise.resolve('/foo'))
    jest.clearAllMocks()
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should validate', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(validators.args).toHaveBeenLastCalledWith(2)
        expect(validators.signed_in).toBeCalled()
        expect(validators.platform).toHaveBeenLastCalledWith('ios', true)
      })
  })

  test('should download app to . by default', () => {
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.api.downloadApp).toBeCalledWith('12', 'ios', '.')
      })
  })

  test('should download app to specified location', () => {
    pgb.opts.commands = [ 'download', '12', 'ios', '/foo' ]
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.api.downloadApp).toBeCalledWith('12', 'ios', '/foo')
      })
  })

  test('should redirect to stdout if specified without progress or printing', () => {
    pgb.opts.stdout = true
    pgb.api.downloadApp = jest.fn(() => {
      process.emit('api/connect', { statusCode: 200, size: 100 })
      process.emit('api/read', { statusCode: 200, size: 100, pos: 100 })
      return Promise.resolve('/foo')
    })
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).not.toBeCalled()
        let call = pgb.api.downloadApp.mock.calls[0]
        expect(call[0]).toBe('12')
        expect(call[1]).toBe('ios')
        expect(call[2]).toBeInstanceOf(require('stream').Writable)
        expect(call[2]).toMatchObject({ _isStdio: true })
        expect(Progress).not.toBeCalledWith('downloading ', 100, 60)
        expect(pgb.print).not.toBeCalled()
      })
  })

  test('should show and update progress', () => {
    pgb.api.downloadApp = jest.fn(() => {
      process.emit('api/connect', { statusCode: 200, size: 100 })
      process.emit('api/read', { size: 100, pos: 50 })
      process.emit('api/read', { size: 100, pos: 100 })
      return Promise.resolve('/foo')
    })
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(Progress.mock.instances[0].update).toBeCalledWith(100, '100 B / 100 B')
        expect(Progress.mock.instances[0].stop).toBeCalledWith()
        expect(pgb.api.downloadApp).toBeCalledWith('12', 'ios', '.')
        expect(Progress).toBeCalledWith('downloading ', 100, 40)
      })
  })

  test('should not show progress on api error', (done) => {
    pgb.api.downloadApp = jest.fn(() => {
      process.emit('api/connect', { statusCode: 400, size: 100 })
      return Promise.reject(new Error('bad'))
    })
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch(() => {
        expect(Progress).not.toBeCalledWith()
        done()
      })
  })

  test('should reject on error', () => {
    pgb.api.downloadApp = jest.fn().mockRejectedValue(new Error('an error'))
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.appAndPlatform).toBeCalled())
  )
})
