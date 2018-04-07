const Progress = require('../../src/util/progress')
const stdout = require('std-mocks')

describe('progress', () => {
  let stdin

  beforeEach(() => {
    stdin = require('mock-stdin').stdin()
    stdout.use()
    jest.spyOn(global, 'setTimeout')
  })

  afterEach(() => {
    stdout.flush()
    stdin.restore()
    stdout.restore()
    jest.restoreAllMocks()
  })

  test('is a function', () => {
    expect(Progress).toBeInstanceOf(Function)
  })

  test('has defaults', () => {
    let progress = new Progress()
    expect(progress.bars).toBeUndefined()
    expect(progress.pos).toBe(0)
    expect(progress.total).toBe(100)
    expect(progress.running).toBeFalsy()
    expect(progress.prefix).toBe('')
  })

  test('sets values from constructor', () => {
    let progress = new Progress(1, 2, 3)
    expect(progress.bars).toBe(3)
    expect(progress.pos).toBe(0)
    expect(progress.total).toBe(2)
    expect(progress.running).toBeFalsy()
    expect(progress.prefix).toBe(1)
  })

  test('update should change values', () => {
    let progress = new Progress()
    expect(progress.pos).toBe(0)
    expect(progress.suffix).toBe('')
    progress.update(50, 'the suffix')
    expect(progress.pos).toBe(50)
    expect(progress.suffix).toBe('the suffix')
  })

  test('start should start progress bar and call setTimeout(tick, 100)', () => {
    let progress = new Progress('Downloading ', 100, 100)
    progress.start()
    expect(progress.running).toBeTruthy()
    expect(stdout.flush().stderr[2]).toMatch(/Downloading {3}0% \[-{100}\]/)
  })

  test('update should output updated progress bar on next tick', () => {
    let progress = new Progress('Downloading ', 100, 100)
    progress.start()
    progress.update(50, 'suffix')
    progress.tick()
    expect(progress.running).toBeTruthy()
    expect(stdout.flush().stderr[5]).toMatch(/Downloading {2}50% \[#{50}-{50}\] suffix/)
  })

  test('no stderr if the line is the same', () => {
    let progress = new Progress('Downloading ', 100, 100)
    progress.start()
    progress.update(50, 'suffix')
    progress.tick()
    stdout.flush()
    progress.tick()
    expect(stdout.flush().stderr).toEqual([])
  })

  test('should stop when pos==total', () => {
    let progress = new Progress('Downloading ', 100, 100)
    progress.start()
    progress.update(100)
    progress.tick()
    let output = stdout.flush().stderr
    expect(output[5]).toMatch(/Downloading 100% \[#{100}\]/)
    expect(output[6]).toMatch(/\n/)
    expect(progress.running).toBeFalsy()
  })

  test('should stop with 100% if true', () => {
    let progress = new Progress('Downloading ', 100, 100)
    progress.start()
    progress.tick()
    progress.stop(true)
    let output = stdout.flush().stderr
    expect(output[5]).toMatch(/Downloading 100% \[#{100}-{0}\]/)
    expect(output[6]).toMatch(/\n/)
    expect(progress.running).toBeFalsy()
  })

  test('should stop without updated if false', () => {
    let progress = new Progress('Downloading ', 100, 100)
    progress.start()
    progress.update(25)
    progress.tick()
    progress.stop()
    let output = stdout.flush().stderr
    expect(output[5]).toMatch(/Downloading {2}25% \[#{25}-{75}\]/)
    expect(output[6]).toMatch(/\n/)
    expect(progress.running).toBeFalsy()
    progress.stop()
    expect(stdout.flush().stderr).toEqual([])
  })
})
