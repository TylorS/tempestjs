import { Timeline, Timeslot } from '../interfaces'

import { PredeterminedTask } from './PredeterminedTask'
import { findIndex, removeAll } from '../util/array'

export class BinaryTimeline implements Timeline<PredeterminedTask> {
  private tasks: Timeslot<PredeterminedTask>[]
  constructor () {
    this.tasks = []
  }

  nextArrival (): number {
    return this.isEmpty()
      ? Infinity
      : this.tasks[0].time
  }

  isEmpty (): boolean {
    return this.tasks.length === 0
  }

  add (task: PredeterminedTask): void {
    insertByTime(task, this.tasks)
  }

  remove (task: PredeterminedTask): boolean {
    const i = binarySearch(task.time, this.tasks)

    if (i >= 0 && i < this.tasks.length) {
      const at = findIndex(task, this.tasks[i].events)
      if (at >= 0) {
        this.tasks[i].events.splice(at, 1)
        return true
      }
    }

    return false
  }

  removeAll (f: (task: PredeterminedTask) => boolean): void {
    for (let i = 0, l = this.tasks.length; i < l; ++i) {
      removeAllFrom(f, this.tasks[i])
    }
  }

  runTasks (time: number, runTask: (task: PredeterminedTask) => any): void {
    const tasks = this.tasks
    const l = tasks.length
    let i = 0

    while (i < l && tasks[i].time <= time) {
      ++i
    }

    this.tasks = tasks.slice(i)

    for (let j = 0; j < i; ++j) {
      this.tasks = runTasks(runTask, tasks[j], this.tasks)
    }
  }
}

function runTasks (runTask: (task: PredeterminedTask) => any,
                   timeslot: Timeslot<PredeterminedTask>,
                   tasks: Timeslot<PredeterminedTask>[]): Timeslot<PredeterminedTask>[] {
  const { events } = timeslot
  for (let i = 0; i < events.length; ++i) {
   const task = events[i]
    if (task.active) {
      runTask(task)
      if (task.period >= 0 && task.active) {
        task.time = task.time + task.period
        insertByTime(task, tasks)
      }
    }
  }
  return tasks
}

function insertByTime (task: PredeterminedTask, timeslots: Timeslot<PredeterminedTask>[]) {
  const l = timeslots.length

  if (l === 0) {
    timeslots.push(BinaryTimeslot.create(task.time, [task]))
    return
  }

  const i = binarySearch(task.time, timeslots)

  if (i >= l) {
    timeslots.push(BinaryTimeslot.create(task.time, [task]));
  } else if (task.time === timeslots[i].time) {
    timeslots[i].events.push(task);
  } else {
    timeslots.splice(i, 0, BinaryTimeslot.create(task.time, [task]));
  }
}

function removeAllFrom (f: (task: PredeterminedTask) => boolean, timeslot: Timeslot<PredeterminedTask>) {
  timeslot.events = removeAll<PredeterminedTask>(f, timeslot.events)
}

function binarySearch (time: number, sortedArray: BinaryTimeslot[]): number {
  let lo = 0
  let hi = sortedArray.length
  let mid: number
  let y: BinaryTimeslot

  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2)
    y = sortedArray[mid]

    if (time === y.time) {
      return mid
    } else if ( time < y.time) {
      hi = mid
    } else {
      lo = mid + 1
    }
    return hi
  }
}

export class BinaryTimeslot implements Timeslot<PredeterminedTask> {
  constructor (public time: number, public events: PredeterminedTask[]) {
  }

  static create (time: number, events: PredeterminedTask[]): BinaryTimeslot {
    return new BinaryTimeslot(time, events)
  }
}
