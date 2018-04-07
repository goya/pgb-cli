const util = require('util')
const session = require('./util/session')
const parseArgs = require('./util/args')
const colours = require('./util/colours')
const version = require('../package.json').version
const api = require('pgb-api')({
  events: process,
  headers: {
    'User-Agent': `pgb-cli/${version} node/${process.version} (${process.platform})`
  }
})

class PGB {
  constructor() {
    this.colours = colours
    this.moduleVersion = version
    this.api = api
    this.session = session
    this.cliOpts = {
      flags: {
        version: 'v', bare: 'b', ascii: 'a', json: 'j', debug: 'd', noprogress: '', help: '?h', force: 'fy', completion: '', stdout: 's', nocolours: 'c', nounlock: '', exit: 'e', exitcode: ''
      },
      aliases: {
        add: 'new',
        create: 'new',
        'add-key': 'new-key',
        'create-key': 'new-key',
        clone: 'pull',
        delete: 'rm',
        'delete-key': 'rm-key',
        apps: 'ls',
        list: 'ls',
        'ls-keys': 'keys',
        'list-keys': 'keys',
        cordovas: 'phonegaps',
        signin: 'login',
        'sign-in': 'login',
        signout: 'logout',
        'sign-out': 'logout',
        'unlock-key': 'unlock',
        me: 'whoami'
      }
    }
  }

  error(obj) {
    console.error(this.colours.error(obj))
  }

  debug(obj) {
    if (this.opts.debug) {
      if (typeof obj === 'string') {
        console.error(this.colours.debug(obj))
      } else {
        console.error(this.colours.debug(util.inspect(obj, { maxArrayLength: null, breakLength: 70, depth: 5 })))
      }
    }
  }

  print(obj) {
    if (typeof obj === 'string') obj = { pretty: obj }

    if (this.opts.json) {
      if (obj.json) console.log(JSON.stringify(obj.json))
    } else if (this.opts.bare) {
      if (obj.bare) console.log(obj.bare)
    } else if (obj.pretty && typeof obj.pretty === 'string') {
      console.log(colours.default(obj.pretty))
    } else if (obj.pretty) {
      console.log(util.inspect(obj.pretty, { colors: true, maxArrayLength: null, breakLength: 70, depth: 5 }))
    }
  }

  runCommand(opts) {
    let command, cmd

    this.opts = opts
    this.api.addAuth(this.opts.variables.auth_token || this.session.load().authtoken)
    this.colours.disabled = this.opts.nocolours
    this.opts.ascii = this.opts.ascii || process.platform === 'win32'

    process.on('debug', pgb.debug.bind(this))

    command = this.opts.commands[0] || 'usage'

    if (this.opts.completion) command = 'completion'
    else if (this.opts.version) command = 'version'
    else if (this.opts.help || command.match(/[^-a-z]+/i)) command = 'usage'

    try {
      cmd = require(`./commands/${command}`)
    } catch (e) {
      pgb.debug(e)
      cmd = require('./commands/usage')
    }

    return cmd()
  }

  handleError(err) {
    if (err) {
      if (err.statusCode === 401) {
        this.error('not signed in')
      } else if (err.code === 'ENOENT') {
        this.error(`file or directory not found: ${err.path}`)
      } else if (err.code === 'EACCES') {
        this.error(`file or directory cannot be opened: ${err.path}`)
      } else if (err.code === 'ENOTDIR') {
        this.error(`directory cannot be created: ${err.path}`)
      } else if (err.error) {
        this.error(this.htmlDecode(err.error))
      } else if ((err instanceof Error)) {
        if (err.message) this.error(this.htmlDecode(err.message))
      } else {
        this.error(this.htmlDecode(err))
      }
    }
    process.exit(1)
  }

  htmlDecode(str) {
    return String(str)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
  }

  run() {
    return parseArgs(pgb.cliOpts)
      .then(opts => this.runCommand(opts))
      .catch(err => this.handleError(err))
  }
}

module.exports = () => new PGB()
