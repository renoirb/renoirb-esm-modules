/**
 * Throttled processor for managing concurrent operations
 *
 * Created with assistance from Claude (Anthropic), 2025-03-19
 * Pattern implementation for front-end component optimization
 *
 * @author Renoir Boulanger
 * @contributor Claude AI
 */
export class ThrottledProcessor {
  constructor(options = {}) {
    this.queue = []
    this.activeCount = 0
    this.maxConcurrent = options.maxConcurrent || 5
    this.watchdogInterval = options.watchdogInterval || 2000
    this.watchdogId = null
    this.isDestroyed = false
    this.startWatchdog()
  }

  add(task)/*: Promise<void> */ {
    if (this.isDestroyed) {
      return Promise.reject(new Error('Processor has been destroyed'))
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
        added: Date.now(),
      })

      this.processNextTasks()
    })
  }

  processNextTasks() {
    if (this.isDestroyed) return

    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift()
      this.activeCount++

      Promise.resolve()
        .then(() => {
          return item.task()
        })
        .then((result) => {
          item.resolve(result)
        })
        .catch((error) => {
          item.reject(error)
        })
        .finally(() => {
          this.activeCount--
          if (!this.isDestroyed) {
            this.processNextTasks()
          }
        })
    }
  }

  startWatchdog() {
    this.stopWatchdog()

    this.watchdogId = setInterval(() => {
      if (this.isDestroyed) {
        this.stopWatchdog()
        return
      }

      if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
        console.log(
          `Watchdog detected stalled processing. Restarting. Queue: ${this.queue.length}`,
        )
        this.processNextTasks()
      }
    }, this.watchdogInterval)
  }

  stopWatchdog() {
    if (this.watchdogId !== null) {
      clearInterval(this.watchdogId)
      this.watchdogId = null
    }
  }

  destroy() {
    if (this.isDestroyed) return

    this.isDestroyed = true
    this.stopWatchdog()

    while (this.queue.length > 0) {
      const item = this.queue.shift()
      item.reject(new Error('Processor was destroyed'))
    }
  }
}
