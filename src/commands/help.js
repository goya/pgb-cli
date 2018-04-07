module.exports = () => {
  pgb.opts.commands.shift()
  pgb.opts.commands[0] = pgb.cliOpts.aliases[pgb.opts.commands[0]] || pgb.opts.commands[0]

  return require('./usage')()
}
