const fs = require('fs')
const session = require('../../src/util/session')
const oldHome = process.env.HOME
const oldUserProfile = process.env.USERPROFILE

describe('session', () => {
  beforeEach(() => {
    process.env.HOME = '/'
    process.env.USERPROFILE = '/windows'
  })

  afterEach(() => {
    process.env.HOME = oldHome
    process.env.USERPROFILE = oldUserProfile
  })

  test('is an object with 3 functions', () => {
    expect(session).toBeInstanceOf(Object)
    expect(session.load).toBeInstanceOf(Function)
    expect(session.clear).toBeInstanceOf(Function)
    expect(session.save).toBeInstanceOf(Function)
  })

  test('should return {} if file not found', () =>
    expect(session.load()).toEqual({})
  )

  test('should save value to .pgbrc and return value', () => {
    expect(session.save({ foo: 'bar' })).toEqual({ foo: 'bar' })
    expect(fs.readFileSync('/.pgbrc').toString()).toEqual('{"foo":"bar"}')
  })

  test('should use windows profile if HOME doesnt exist', () => {
    fs.mkdirSync(process.env.USERPROFILE)
    delete process.env.HOME

    expect(session.save({ foo: 'bar' })).toEqual({ foo: 'bar' })
    expect(fs.readFileSync(`/${process.env.USERPROFILE}/.pgbrc`).toString()).toEqual('{"foo":"bar"}')
  })

  test('should load value from disc', () =>
    expect(session.load()).toEqual({ foo: 'bar' })
  )

  test('should delete file and return {} on clear', () => {
    expect(session.clear()).toEqual({})
    expect(fs.existsSync('/.pgbrc')).toBeFalsy()
  })

  test('should return {} on clear even if already deleted', () => {
    expect(fs.existsSync('/.pgbrc')).toBeFalsy()
    expect(session.clear()).toEqual({})
  })
})
