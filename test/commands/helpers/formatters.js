const formatters = require('../../../src/commands/helpers/formatters')
const colours = require('../../../src/util/colours')

describe('formatters', () => {
  beforeAll(() => { global.pgb = { opts: {} } })

  test('should format platforms', () => {
    expect(formatters.os('winphone')).toBe('Windows')
    expect(formatters.os('ios')).toBe('iOS    ')
    expect(formatters.os('android')).toBe('Android')
    expect(formatters.os('windows')).toBe('Windows')
  })

  test('should format status', () => {
    expect(formatters.status('skip')).toBe(colours.debug('SKIPPED '))
    expect(formatters.status('complete')).toBe(colours.done('SUCCESS '))
    expect(formatters.status('error')).toBe(colours.error('FAILED  '))
    expect(formatters.status('pending')).toBe(colours.pending('BUILDING'))
    expect(formatters.status('other')).toBe(colours.pending('BUILDING'))
  })

  test('should format dates', () => {
    expect(formatters.date('2018-03-04 14:10:52 -0800')).toBe('2018-03-04')
    expect(formatters.date('2018-12-12 14:10:52 -0800')).toBe('2018-12-12')
  })

  test('should trunc string', () => {
    expect(formatters.trunc('1234567890', 5)).toBe('12...')
    expect(formatters.trunc('12345', 5)).toBe('12345')
    expect(formatters.trunc('高ぶる白かった', 8)).toBe('高ぶ...')
    pgb.opts.ascii = true
    expect(formatters.trunc('高ぶる白かった', 8)).toBe('???????')
  })

  test('should format sizes', () => {
    expect(formatters.size('0')).toBe('0 B')
    expect(formatters.size('1')).toBe('1 B')
    expect(formatters.size('1000')).toBe('1.0 KB')
    expect(formatters.size('10000')).toBe('9.8 KB')
    expect(formatters.size('100000')).toBe('97.7 KB')
    expect(formatters.size('1000000')).toBe('1.0 MB')
    expect(formatters.size('10000000')).toBe('9.5 MB')
    expect(formatters.size('100000000')).toBe('95.4 MB')
    expect(formatters.size('1000000000')).toBe('0.9 GB')
    expect(formatters.size('10000000000')).toBe('9.3 GB')
  })
})
