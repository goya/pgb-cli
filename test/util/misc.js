const misc = require('../../src/util/misc')
jest.mock('jest-plugin-fs/mock')
const path = require('path')
const fs = require('fs')

describe('merge', () => {
  test('is a function that returns an object', () => {
    expect(misc.merge).toBeInstanceOf(Function)
    expect(misc.merge()).toEqual({})
  })

  test('handles null values', () => {
    expect(misc.merge(null)).toEqual({})
    expect(misc.merge(null, null)).toEqual({})
    expect(misc.merge(null, { a: true }, null)).toEqual({ a: true })
  })

  test('returns a clone of all objects', () => {
    const obj = { a: true }
    expect(misc.merge(obj) === obj).toBeFalsy()
  })

  test('last one wins', () => {
    expect(misc.merge({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({ a: 3 })
  })

  test('does nested merging', () => {
    expect(misc.merge({ a: { c: [], b: 1 } }, { a: { b: 2 } }, { a: { c: 3 } })).toEqual({ a: { b: 2, c: 3 } })
  })
})

describe('promiseSeries', () => {
  test('is a function that returns an object', () => {
    expect(misc.promiseSeries).toBeInstanceOf(Function)
  })

  test('return valid results', (done) => {
    let slow = new Promise((resolve, reject) => setTimeout(() => resolve(1), 500))
    let fast = new Promise((resolve, reject) => resolve(2))
    let func = () => 3

    let promises = misc.promiseSeries(slow, fast, func, 4)

    jest.advanceTimersByTime(4000)

    promises.then((result) => {
      expect(result).toMatchObject([1, 2, 3, 4])
      done()
    })
  })
})

describe('mkdirp', () => {
  test('is a function that returns an object', () => {
    expect(misc.mkdirp).toBeInstanceOf(Function)
  })

  test('handles null (current dir)', () => {
    fs.existsSync.mockReturnValue(true)
    misc.mkdirp(null)
    expect(fs.mkdirSync).not.toHaveBeenCalled()
    expect(fs.existsSync).toHaveBeenLastCalledWith(process.cwd() + path.sep)
  })

  test('handles blank (current dir)', () => {
    fs.existsSync.mockReturnValue(true)
    misc.mkdirp('')
    expect(fs.mkdirSync).not.toHaveBeenCalled()
    expect(fs.existsSync).toHaveBeenLastCalledWith(process.cwd() + path.sep)
  })

  test('only creates dir if not already created', () => {
    fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false)
    misc.mkdirp('/foo/bar')
    expect(fs.mkdirSync.mock.calls).toEqual([['/foo/bar/']])
    expect(fs.existsSync).toHaveBeenLastCalledWith('/foo/bar/')
  })
})
