const merge = require('../../src/util/misc').merge
const validators = require('../../src/commands/helpers/validators')
const prompt = require('../../src/util/prompt')
jest.mock('../../src/util/prompt')
jest.mock('../../src/util/session')

module.exports = (defaults) => {
  jest.genMockFromModule('../../src/index')
  global.pgb = require('../../src/index')()
  global.pgb.colours.disabled = true
  prompt.mockReturnValue(12)

  // spy on output function
  jest.spyOn(pgb, 'error').mockReturnValue()
  jest.spyOn(pgb, 'print').mockReturnValue()
  jest.spyOn(pgb, 'debug').mockReturnValue()
  jest.spyOn(pgb, 'handleError').mockReturnValue()

  // spy on validators
  jest.spyOn(validators, 'args')
  jest.spyOn(validators, 'key_platform')
  jest.spyOn(validators, 'platform')
  jest.spyOn(validators, 'variables')
  jest.spyOn(validators, 'id')
  jest.spyOn(validators, 'signed_in')

  // reset opts and merge defaults
  pgb.opts = merge({ variables: {}, commands: [] }, defaults)

  // sign in person
  global.pgb.api = {}
  global.pgb.api.hasAuth = () => true
}
