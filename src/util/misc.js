const fs = require('fs')
const path = require('path')

/**
 * execute promises in series return array of results
 */
const promiseSeries = (...funcs) =>
  funcs.reduce((promise, func) =>
    promise.then(result => {
      func = (typeof func === 'function') ? func() : func
      func = (func.then) ? func : Promise.resolve(func)
      return func.then(Array.prototype.concat.bind(result))
    }), Promise.resolve([]))

/**
 * deep merge a collection of objs returning a new object
 */
const merge = function() {
  const clone = (source, dest) => {
    for (let prop in source) {
      if (source[prop] && source[prop].constructor === Object) {
        dest[prop] = dest[prop] || {}
        dest[prop] = clone(source[prop], dest[prop])
      } else {
        dest[prop] = source[prop]
      }
    }
    return dest
  }

  return Array.from(arguments).reduce((result, obj) => clone(obj, result), {})
}

/**
 * synchronously make directory creating intermediate directories as required
 */
const mkdirp = function(dir) {
  dir = dir || ''
  let parts = path.resolve(dir).split(path.sep)
  for (let i = 1; i < parts.length; i++) {
    let segment = path.join(parts.slice(0, i + 1).join(path.sep) + path.sep)
    if (!fs.existsSync(segment)) fs.mkdirSync(segment)
  }
}

module.exports = { mkdirp, merge, promiseSeries }
