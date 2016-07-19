import { Timer, Task } from '../interfaces'
import { defer } from '../util/task'

export class ClockTimer implements Timer<Asap> {
  now (): number {
    return Date.now()
  }

  setTimer (fn: () => any, delayTime: number): Asap | any {
    return delayTime <= 0
      ? runAsTask(fn)
      : setTimeout(fn, delayTime)
  }

  clearTimer (task: Asap | any ) {
    return task instanceof Asap
      ? task.dispose()
      : clearTimeout(task)
  }
}

export class Asap implements Task {
  private f: () => any
  private active: boolean
  constructor (f: () => any) {
    this.f = f
    this.active = true
  }

  run (time: number): void {
    if (this.active) this.f()
  }

  error (time: number, e: Error) {
    throw e
  }

  dispose (): void {
    this.active = false
  }
}

function runAsTask (f: () => any) {
  const task = new Asap(f)
  defer(task)
  return task
}