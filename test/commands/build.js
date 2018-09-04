const command = require('../../src/commands/build')
const validators = require('../../src/commands/helpers/validators')
const wait = require('../../src/commands/helpers/wait')
jest.mock('../../src/commands/helpers/wait')
wait.mockResolvedValue({ id: 12, wait: true })
const complete = require('../../src/commands/helpers/complete')
jest.mock('../../src/commands/helpers/complete')

describe('build', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: ['build', '12'] })
    pgb.api.buildApp = jest.fn(() => Promise.resolve({ id: 12 }))
  })

  afterAll(() => {
    delete global.pgb
  })

  test('with platforms', () => {
    pgb.opts.commands.push('ios')
    pgb.opts.commands.push('android')
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(validators.signed_in).toBeCalled()
        expect(validators.args).toHaveBeenLastCalledWith(1)
        expect(validators.platform).toHaveBeenCalledTimes(2)
        expect(validators.id).toHaveBeenLastCalledWith('12')
      })
  })

  test('should call buildApp with id', () => {
    return Promise.resolve()
      .then(command)
      .then((cmd) => {
        expect(pgb.api.buildApp).toBeCalledWith('12', [''])
        expect(wait).toBeCalledWith({ id: 12 })
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'id': 12, 'wait': true } })
      })
  })

  test('should call buildApp with id and platform', () => {
    pgb.opts.commands.push('ios')
    return Promise.resolve()
      .then(command)
      .then((cmd) => {
        expect(pgb.api.buildApp).toBeCalledWith('12', ['ios'])
        expect(wait).toBeCalledWith({ id: 12 })
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'id': 12, 'wait': true } })
      })
  })

  test('should call buildApp with id and platforms', () => {
    pgb.opts.commands.push('ios,windows', 'android')
    return Promise.resolve()
      .then(command)
      .then((cmd) => {
        expect(pgb.api.buildApp).toBeCalledWith('12', ['ios', 'winphone', 'android'])
        expect(wait).toBeCalledWith({ id: 12 })
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'id': 12, 'wait': true } })
      })
  })

  test('should reject on error', (done) => {
    pgb.api.buildApp = jest.fn(() => { throw new Error('an error') })
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
      .then(() => expect(complete.appAndPlatform).toBeCalled())
  )
})
