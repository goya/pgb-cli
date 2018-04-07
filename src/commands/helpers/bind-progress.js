const Progress = require('../../util/progress')
const format = require('./formatters')

module.exports = () => {
  let progress = {}

  progress.zipFiles = (files) => {
    pgb.debug(files)
  }

  progress.zipEnd = (files) => {
    progress.zipProgress && progress.zipProgress.stop()
  }

  progress.apiConnect = (files) => {
    progress.uploadProgress && progress.uploadProgress.stop()
  }

  progress.apiWrite = (status) => {
    if (!progress.zipProgress && status.size < 50000) {
      return
    }

    if (!progress.uploadProgress) {
      progress.uploadProgress = new Progress('uploading ', status.size, 40)
      progress.uploadProgress.start()
    }
    progress.uploadProgress.update(status.pos, `${format.size(status.pos)} / ${format.size(status.size)}`)
  }

  progress.zipWrite = (status) => {
    if (!progress.zipProgress) {
      progress.zipProgress = new Progress('archiving ', status.size, 40)
      progress.zipProgress.start()
    }
    progress.zipProgress.update(status.pos, `${format.size(status.pos)} / ${format.size(status.size)}`)
  }

  progress.unbind = () => {
    process.removeListener('zip/files', progress.zipFiles)
    process.removeListener('zip/end', progress.zipEnd)
    process.removeListener('api/connect', progress.apiConnect)
    process.removeListener('zip/write', progress.zipWrite)
    process.removeListener('api/write', progress.apiWrite)
  }

  progress.stop = () => {
    progress.zipProgress && progress.zipProgress.stop()
    progress.uploadProgress && progress.uploadProgress.stop()
  }

  if (!pgb.opts.noprogress) {
    process.once('zip/files', progress.zipFiles)
    process.once('zip/end', progress.zipEnd)
    process.once('api/connect', progress.apiConnect)
    process.on('zip/write', progress.zipWrite)
    process.on('api/write', progress.apiWrite)
  }

  return progress
}
