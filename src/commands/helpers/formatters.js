const vw = require('visualwidth')
const colours = require('../../util/colours')

module.exports.os = os => {
  switch (os) {
    case 'ios':
      return 'iOS    '
    case 'android':
      return 'Android'
    default:
      return 'Windows'
  }
}

module.exports.status = status => {
  switch (status) {
    case 'skip':
      return colours.debug('SKIPPED ')
    case 'complete':
      return colours.done('SUCCESS ')
    case 'error':
      return colours.error('FAILED  ')
    default:
      return colours.pending('BUILDING')
  }
}

module.exports.trunc = (str, len) => {
  if (pgb.opts.ascii) str = str.replace(/[^\x00-\x7F]/g, '?') // eslint-disable-line no-control-regex
  return vw.truncate(str || '', len, '...')
}

module.exports.date = str => {
  let date = new Date(str)
  let day = date.getDate()
  day = day <= 9 ? `0${day}` : day

  let month = date.getMonth() + 1
  month = month <= 9 ? `0${month}` : month

  let year = date.getFullYear()

  return `${year}-${month}-${day}`
}

module.exports.size = (bytes) => {
  if (bytes == 0) return '0 B' /* eslint-disable-line eqeqeq */
  let e = Math.floor(Math.log(bytes) / Math.log(1000))
  if (e === 0) return bytes + ' B'
  return (bytes / Math.pow(1024, e)).toFixed(1) + ' ' + ' KMGTP'.charAt(e) + 'B'
}
