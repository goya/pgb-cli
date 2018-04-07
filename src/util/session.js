const fs = require('fs')
const path = require('path')

const configFile = () => path.join(process.env.HOME || process.env.USERPROFILE, '.pgbrc')

module.exports = {
  path: configFile(),
  load: () => {
    try {
      return JSON.parse(fs.readFileSync(configFile()))
    } catch (e) {}
    return {}
  },

  clear: () => {
    if (fs.existsSync(configFile())) {
      fs.unlinkSync(configFile())
    }
    return {}
  },

  save: (obj) => {
    fs.writeFileSync(configFile(), JSON.stringify(obj), { mode: '0600' })
    return obj
  }
}
