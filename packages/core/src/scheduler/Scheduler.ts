import { Scheduler, Timer, Timeline, Task } from '../interfaces'
import { Asap } from './ClockTimer'
import { PredeterminedTask } from './PredeterminedTask'
import { runScheduledTask } from '../util/task'

export class TaskScheduler implements Scheduler {
  private timer: Timer<Asap | number>
  private timeline: Timeline<PredeterminedTask>

  private _timer: Asap | number
  private _nextArrival: number

  private _runReadyTasksBound: () => any

  constructor (timer: Timer<Asap>, timeline: Timeline<PredeterminedTask>) {
    this.timer = timer
    this.timeline = timeline

    this._timer = null
    this._nextArrival = Infinity

    const self = this
    this._runReadyTasksBound = () => self._runReadyTasks(self.now())
  }

  now (): number {
    return this.timer.now()
  }

  asap (task: Task): PredeterminedTask {
    return this.schedule(0, -1, task)
  }

  delay (delay: number, task: Task): PredeterminedTask {
    return this.schedule(delay, -1, task)
  }

  periodic (period: number, task: Task): PredeterminedTask {
    return this.schedule(0, period, task)
  }

  schedule (delay: number, period: number, task: Task): PredeterminedTask {
    const time = this.now()
    const st = new PredeterminedTask(+(time) + Math.max(0, delay), period, task, this)

    this.timeline.add(st)
    this._scheduleNextRun(+(time))

    return st
  }

  cancel (task: PredeterminedTask) {
    task.active = false
    if (this.timeline.remove(task)) {
      this._reschedule()
    }
  }

  cancelAll (f: (task: PredeterminedTask) => boolean) {
    this.timeline.removeAll(f)
    this._reschedule()
  }

  private _reschedule () {
    if (this.timeline.isEmpty()) {
      this._unschedule()
    } else {
      this._scheduleNextRun(this.now())
    }
  }

  private _unschedule () {
    this.timer.clearTimer(this._timer)
    this._timer = null
  }

  private _scheduleNextRun (time: number) {
    if (this.timeline.isEmpty()) return

    const nextArrival = this.timeline.nextArrival()

    if (this._timer === null) {
      this._scheduleNextArrival(nextArrival, time)
    } else if (nextArrival < this._nextArrival) {
      this._unschedule()
      this._scheduleNextArrival(nextArrival, time)
    }
  }

  private _scheduleNextArrival (nextArrival: number, time: number) {
    this._nextArrival = nextArrival
    const delay = Math.max(0, nextArrival - time)
    this._timer = this.timer.setTimer(this._runReadyTasksBound, delay)
  }

  private _runReadyTasks (time: number) {
    this._timer = null
    this.timeline.runTasks(time, runScheduledTask)
    this._scheduleNextRun(this.now())
  }
}