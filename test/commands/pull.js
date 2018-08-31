const command = require('../../src/commands/pull')
const update = require('../../src/commands/update')
jest.mock('../../src/commands/update')
update.mockResolvedValue('update')
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('pull', () => {
  afterEach(() => {
    delete global.pgb
  })

  beforeEach(() => {
    require('../_helpers/pgb')()
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should add pull variable and just go to update', () =>
    Promise.resolve()
      .then(command)
      .then((cmd) => {
        expect(cmd).toEqual('update')
        expect(pgb.opts).toEqual({ commands: [], 'variables': { 'pull': true } })
      })
  )

  test('should reject on error', (done) => {
    update.mockRejectedValue(new Error('an error'))
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
        done()
      })
  })

  test('should support completion', () =>
    Promise.resolve()
      .then(command.completion)
      .then(() => expect(complete.app).toBeCalled())
  )
})
