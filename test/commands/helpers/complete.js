const complete = require('../../../src/commands/helpers/complete.js')

describe('complete', () => {
  beforeEach(() => {
    require('../../_helpers/pgb')({ commands: [ 'download', '12', 'ios' ] })
    pgb.api.downloadApp = jest.fn(() => Promise.resolve('/foo'))
    jest.clearAllMocks()
  })

  describe('app', () => {
    test('should return app ids', () => {
      pgb.opts.idx = 1
      pgb.api.getApps = jest.fn().mockResolvedValue({ apps: [{ id: 12 }, { id: 13 }] })
      return Promise.resolve()
        .then(complete.app)
        .then((result) => {
          expect(result).toEqual([12, 13])
          expect(pgb.api.getApps).toBeCalledWith()
        })
    })

    test('should return nothing if not on correct idx', () =>
      Promise.resolve()
        .then(complete.app)
        .then((result) => {
          expect(result).toEqual()
        })
    )
  })

  describe('appAndPlatform', () => {
    test('should return app ids', () => {
      pgb.opts.idx = 1
      pgb.api.getApps = jest.fn().mockResolvedValue({ apps: [{ id: 12 }, { id: 13 }] })
      return Promise.resolve()
        .then(complete.appAndPlatform)
        .then((result) => {
          expect(result).toEqual([12, 13])
          expect(pgb.api.getApps).toBeCalledWith()
        })
    })

    test('should return platforms', () => {
      pgb.opts.idx = 2
      return Promise.resolve()
        .then(complete.appAndPlatform)
        .then((result) => {
          expect(result).toEqual(['windows', 'android', 'ios'])
        })
    })

    test('should return nothing if not on correct idx', () =>
      Promise.resolve()
        .then(complete.appAndPlatform)
        .then((result) => {
          expect(result).toEqual()
        })
    )
  })

  describe('key', () => {
    test('should return key ids', () => {
      pgb.opts.commands = [ 'key', 'ios' ]
      pgb.opts.idx = 2
      pgb.api.getKeys = jest.fn().mockResolvedValue({ keys: [{ id: 12 }, { id: 13 }] })
      return Promise.resolve()
        .then(complete.key)
        .then((result) => {
          expect(result).toEqual([12, 13])
          expect(pgb.api.getKeys).toBeCalledWith('ios')
        })
    })

    test('should return platforms', () => {
      pgb.opts.idx = 1
      return Promise.resolve()
        .then(complete.key)
        .then((result) => {
          expect(result).toEqual(['windows', 'android', 'ios'])
        })
    })
    test('should return nothing if not on correct idx', () =>
      Promise.resolve()
        .then(complete.key)
        .then((result) => {
          expect(result).toEqual()
        })
    )
  })

  describe('platform', () => {
    test('should return lockable platforms', () => {
      pgb.opts.idx = 1
      return Promise.resolve()
        .then(() => complete.platform())
        .then((result) => {
          expect(result).toEqual(['windows', 'android', 'ios', 'winphone'])
        })
    })

    test('should return nothing if not on correct idx', () =>
      Promise.resolve()
        .then(() => complete.platform())
        .then((result) => {
          expect(result).toEqual()
        })
    )
  })
})
