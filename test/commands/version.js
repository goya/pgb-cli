const version = require('../../src/commands/version')

describe('version', () => {
  beforeEach(() => {
    require('../_helpers/pgb')()
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should validate id', () => {
    pgb.moduleVersion = '12'
    return Promise.resolve()
      .then(version)
      .then(() => expect(pgb.print).toHaveBeenLastCalledWith(pgb.colours.done('12')))
  })
})
