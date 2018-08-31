const command = require('../../src/commands/help')
const usage = require('../../src/commands/usage')
jest.mock('../../src/commands/usage')
usage.mockResolvedValue('usage')

describe('pull', () => {
  beforeEach(() => {
    require('../_helpers/pgb')()
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should strip help and redirect to usage', () => {
    pgb.opts.commands = [ 'foo', 'bar' ]
    return Promise.resolve()
      .then(command)
      .then((cmd) => {
        expect(cmd).toEqual('usage')
        expect(pgb.opts).toEqual({ 'commands': ['bar'], 'variables': {} })
      })
  })

  test('should reject on error', (done) => {
    usage.mockRejectedValue(new Error('an error'))
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
        done()
      })
  })
})
