const command = require('../../src/commands/login')
const prompt = require('../../src/util/prompt')
jest.mock('../../src/util/prompt')

describe('login', () => {
  beforeEach(() => {
    require('../_helpers/pgb')({ commands: [ 'login' ] })

    pgb.api.me = jest.fn(() => Promise.reject(new Error('bad')))
    pgb.api.getToken = jest.fn(() => Promise.resolve({ token: 'abcd' }))
    pgb.api.addAuth = jest.fn(() => true)

    pgb.session.load = jest.fn(() => { return { authtoken: 'abcd' } })
    jest.clearAllMocks()
    prompt.mockReset()
      .mockResolvedValueOnce('user@example.com')
      .mockResolvedValueOnce('password')
  })

  afterAll(() => {
    delete global.pgb
  })

  test('should skip if already logged in', () => {
    pgb.api.me = jest.fn(() => Promise.resolve({ email: 'user@example.com', id: 12 }))
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'email': 'user@example.com', 'id': 12 }, 'pretty': 'signed in as user@example.com' })
        expect(pgb.api.me).toBeCalled()
        expect(prompt).not.toBeCalled()
      })
  })

  test('should log in if correct user/pass', () => {
    pgb.api.me = jest.fn()
      .mockRejectedValueOnce(new Error('bad'))
      .mockResolvedValue({ email: 'user@example.com', id: 12 })
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'email': 'user@example.com', 'id': 12 }, 'pretty': 'signed in as user@example.com' })
        expect(pgb.api.getToken).toBeCalledWith('user@example.com', 'password')
        expect(pgb.api.me).toHaveBeenCalledTimes(2)
        expect(prompt).toHaveBeenCalledTimes(2)
      })
  })

  test('should log in if correct auth token', () => {
    prompt.mockReset().mockResolvedValueOnce('an_auth_token')
    pgb.api.me = jest.fn()
      .mockRejectedValueOnce(new Error('bad'))
      .mockResolvedValue({ email: 'user@example.com', id: 12 })
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'email': 'user@example.com', 'id': 12 }, 'pretty': 'signed in as user@example.com' })
        expect(pgb.api.getToken).not.toBeCalled()
        expect(pgb.api.me).toHaveBeenCalledTimes(2)
        expect(prompt).toHaveBeenCalledTimes(1)
      })
  })

  test('should log in if auth token in env', () => {
    pgb.opts.variables = { auth_token: 'abcd' }
    pgb.api.me = jest.fn()
      .mockRejectedValueOnce(new Error('bad'))
      .mockResolvedValue({ email: 'user@example.com', id: 12 })
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'email': 'user@example.com', 'id': 12 }, 'pretty': 'signed in as user@example.com' })
        expect(pgb.api.getToken).not.toBeCalled()
        expect(pgb.api.me).toHaveBeenCalledTimes(2)
        expect(prompt).not.toHaveBeenCalled()
      })
  })

  test('should log in if auth token in cmd', () => {
    pgb.opts.commands.push('abcd')
    pgb.api.me = jest.fn()
      .mockRejectedValueOnce(new Error('bad'))
      .mockResolvedValue({ email: 'user@example.com', id: 12 })
    return Promise.resolve()
      .then(command)
      .then(() => {
        expect(pgb.print).toBeCalledWith({ 'bare': 12, 'json': { 'email': 'user@example.com', 'id': 12 }, 'pretty': 'signed in as user@example.com' })
        expect(pgb.api.getToken).not.toBeCalled()
        expect(pgb.api.me).toHaveBeenCalledTimes(2)
        expect(prompt).not.toHaveBeenCalled()
      })
  })

  test('should fail if bad password', (done) => {
    let err = new Error('bad')
    err.statusCode = 401
    pgb.api.getToken = jest.fn(() => Promise.reject(err))
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('Adobe ID or password incorrect'))
        done()
      })
  })

  test('should fail if bad auth token', (done) => {
    prompt.mockReset().mockResolvedValueOnce('an_auth_token')
    let err = new Error('bad')
    err.statusCode = 401
    pgb.api.me = jest.fn(() => Promise.reject(err))
    return Promise.resolve()
      .then(command)
      .then(done.fail)
      .catch((err) => {
        expect(err).toMatchObject(new Error('invalid authentication token'))
        done()
      })
  })

  test('should reject on error', () => {
    pgb.api.getToken = jest.fn(() => { throw new Error('an error') })
    return Promise.resolve()
      .then(command)
      .catch((err) => {
        expect(err).toMatchObject(new Error('an error'))
      })
  })
})
