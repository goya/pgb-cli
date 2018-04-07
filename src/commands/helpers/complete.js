const has = require('./validators')

const apps = () => pgb.api.getApps().then(data => data.apps.map(i => i.id))
const platforms = (all) => (all) ? ['windows', 'android', 'ios', 'winphone'] : ['windows', 'android', 'ios']

module.exports = {
  app: () => {
    if (pgb.opts.idx === 1) {
      return apps()
    }
  },
  appAndPlatform: () => {
    if (pgb.opts.idx === 1) {
      return apps()
    } else if (pgb.opts.idx === 2) {
      return platforms()
    }
  },
  key: (all) => {
    if (pgb.opts.idx === 1) {
      return platforms(all)
    } else if (pgb.opts.idx === 2) {
      let platform = has.key_platform(pgb.opts.commands[1], true)
      return pgb.api.getKeys(platform).then(data => data.keys.map(i => i.id))
    }
  },
  platform: () => {
    if (pgb.opts.idx === 1) {
      return platforms(true)
    }
  }
}
