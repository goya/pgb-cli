const wait = require('../../../src/commands/helpers/wait')
const stdout = require('std-mocks')

describe('progress', () => {
  beforeEach(() => {
    stdout.use()
    require('../../_helpers/pgb')()
    pgb.api.getApp = jest.fn(() => Promise.resolve({id: 12, package: 'com.example', error: {}, getApp: true, completed: true}))
    pgb.api.getStatus = jest.fn(() => Promise.resolve({id: 12, getStatus: true, error: {}, status: {}, completed: true}))
  })

  afterEach(() => {
    stdout.flush()
    stdout.restore()
    jest.restoreAllMocks()
  })

  test('is a function', () => {
    expect(wait).toBeInstanceOf(Function)
  })

  test('should resolve with app if already completed', () => {
    return wait({id: 12, package: 'com.example', status: {}, error: {}, completed: true})
      .then((app) => {
        expect(app).toEqual({id: 12, package: 'com.example', status: {}, error: {}, completed: true})
        expect(pgb.api.getApp).not.toBeCalled()
        expect(pgb.api.getStatus).not.toBeCalled()
      })
  })

  test('should resolve with app if exit', () => {
    pgb.opts.exit = true
    return wait({id: 12, package: 'com.example', status: {}, error: {}, completed: true})
      .then((app) => {
        expect(app).toEqual({id: 12, package: 'com.example', status: {}, error: {}, completed: true})
        expect(pgb.api.getApp).not.toBeCalled()
        expect(pgb.api.getStatus).not.toBeCalled()
      })
  })

  test('should rejest if exitcode and a failed build', (done) => {
    pgb.opts.exitcode = true
    return wait({id: 12, package: 'com.example', status: {}, error: { android: 'bad' }, completed: true})
      .then(done.fail)
      .catch((err) => {
        expect(err).toEqual(new Error())
        expect(pgb.api.getApp).not.toBeCalled()
        expect(pgb.api.getStatus).not.toBeCalled()
        done()
      })
  })

  test('should not reject if exitcode and a successful build', (done) => {
    pgb.opts.exitcode = true
    return wait({id: 12, package: 'com.example', status: {}, error: { }, completed: true})
      .then((app) => {
        expect(app).toEqual({id: 12, package: 'com.example', status: {}, error: { }, completed: true})
        expect(pgb.api.getApp).not.toBeCalled()
        expect(pgb.api.getStatus).not.toBeCalled()
        expect(stdout.flush().stderr).toHaveLength(1)
      })
  })

  test('should not reject if not exitcode and a failed build', () => {
    pgb.opts.exitcode = false
    return wait({id: 12, package: 'com.example', status: {}, error: { android: 'bad' }, completed: true})
      .then((app) => {
        expect(app).toEqual({id: 12, package: 'com.example', status: {}, error: { android: 'bad' }, completed: true})
        expect(pgb.api.getApp).not.toBeCalled()
        expect(pgb.api.getStatus).not.toBeCalled()
        expect(stdout.flush().stderr).toHaveLength(1)
      })
  })

  test('should getStatus every 2 second', () => {
    Date.now = jest.fn()
    Date.now
      .mockReturnValueOnce(new Date('1-1-1999 10:10:05'))
      .mockReturnValue(new Date('1-1-1999 10:10:15'))
    wait({id: 12, package: 'com.example', status: {}, error: {}})
    jest.advanceTimersByTime(4000)
    expect(pgb.api.getStatus).toHaveBeenCalledTimes(2)
  })

  test('should not print if noprogress', () => {
    pgb.opts.noprogress = true
    wait({id: 12, package: 'com.example', status: {}, error: {}})
    jest.advanceTimersByTime(4000)
    expect(stdout.flush().stderr).toEqual([])
  })
})
