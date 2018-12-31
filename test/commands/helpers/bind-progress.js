const BindProgress = require('../../../src/commands/helpers/bind-progress')
const Progress = require('../../../src/util/progress')
jest.mock('../../../src/util/progress')
let bindProgress

describe('bind-progress', () => {
  beforeEach(() => {
    require('../../_helpers/pgb')()
    pgb.opts.debug = true
    jest.clearAllMocks()
    bindProgress = BindProgress()
  })

  afterEach(() => {
    bindProgress.stop()
    bindProgress.unbind()
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should have a stop function', () => {
    expect(bindProgress.stop).toBeInstanceOf(Function)
  })

  test('should not throw on stop if they havent started', () => {
    bindProgress.stop()
  })

  test('should bind events', () => {
    expect(process.eventNames().join()).toContain(['zip/files', 'zip/end', 'api/connect', 'zip/write', 'api/write'])
  })

  test('should debug files on zip/files event', () => {
    process.emit('zip/files', { foo: 'bar' })
    expect(pgb.debug).toHaveBeenCalledWith({ foo: 'bar' })
  })

  test('should stop progress on end events', () => {
    process.emit('api/write', { size: 2000000, pos: 25 })
    process.emit('zip/write', { size: 2000000, pos: 25 })
    process.emit('api/connect')
    process.emit('zip/end')
    expect(Progress.mock.instances[0].stop).toHaveBeenCalledWith()
    expect(Progress.mock.instances[1].stop).toHaveBeenCalledWith()
  })

  test('should instantiate and/or update progress on api/write', () => {
    process.emit('api/write', { size: 2000000, pos: 25 })
    process.emit('api/write', { size: 2000000, pos: 25 })
    expect(Progress).toHaveBeenCalledWith('uploading ', 2000000, 40)
    expect(Progress.mock.instances[0].update).toHaveBeenCalledWith(25, '25 B / 1.9 MB')
  })

  test('should not instantiate and/or update progress on api/write if too small', () => {
    process.emit('api/write', { size: 100, pos: 25 })
    expect(Progress).not.toHaveBeenCalledWith()
  })

  test('should instantiate and/or update progress on api/write if too small but has zipper', () => {
    process.emit('zip/write', { size: 2000000, pos: 25 })
    expect(Progress.mock.instances[0].update).toHaveBeenCalledWith(25, '25 B / 1.9 MB')
    process.emit('api/write', { size: 100, pos: 22 })
    expect(Progress.mock.instances[1].update).toHaveBeenCalledWith(22, '22 B / 100 B')
  })

  test('should not instantiate and/or update progress on api/write if noprogress', () => {
    pgb.opts.noprogress = true
    process.emit('api/write', { size: 2000000, pos: 25 })
    expect(Progress).not.toHaveBeenCalledWith()
  })

  test('should instantiate and/or update progress on zip/write', () => {
    process.emit('zip/write', { size: 200000, pos: 25 })
    process.emit('zip/write', { size: 200000, pos: 25 })
    expect(Progress).toHaveBeenCalledWith('archiving ', 200000, 40)
  })

  test('should not bind events if noprogress', () => {
    bindProgress.stop()
    bindProgress.unbind()
    pgb.opts.noprogress = true
    bindProgress = BindProgress()
    process.emit('zip/write', { size: 2000000, pos: 25 })
    expect(process.eventNames()).not.toContain(['zip/files', 'zip/end', 'api/connect', 'zip/write', 'api/write'])
    expect(Progress).not.toHaveBeenCalled()
  })
})
