const readline = require('readline')

class Progress {
  constructor(prefix, total, bars) {
    this.pos = 0
    this.total = total || 100
    this.running = false
    this.prefix = prefix || ''
    this.bars = bars
    this.suffix = ''
    this.lastLine = ''
    this.done = '#'
    this.undone = '-'
  }

  stop(final) {
    if (this.running) {
      this.running = false
      if (final) this.update(this.total, '')
      this.tick()
      process.stderr.write('\n')
    }
  }

  tick() {
    let percent = Math.floor((this.pos / this.total) * 100)
    let dones = Math.floor((percent / 100) * this.bars)
    let undones = this.bars - dones
    let line = `${this.prefix}${('  ' + percent).slice(-3)}% [` +
        this.done.repeat(dones) +
        this.undone.repeat(undones) +
        `] ${this.suffix || ''}`.trim()
    if (line !== this.lastLine) {
      readline.clearLine(process.stderr, 0)
      readline.cursorTo(process.stderr, 0)
      process.stderr.write(line)
      this.lastLine = line
    }

    if (this.running) {
      if (this.pos === this.total) {
        return this.stop()
      } else {
        setTimeout(this.tick.bind(this), 100)
      }
    }
  }

  start() {
    this.running = true
    this.tick()
  }

  update(pos, suffix) {
    this.pos = pos
    this.suffix = suffix
  }
}

module.exports = Progress
