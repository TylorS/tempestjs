import { Task, ScheduledTask, Scheduler } from '../interfaces'

export class PredeterminedTask implements ScheduledTask {
  public task: Task
  public time: number
  public period: number
  private scheduler: Scheduler
  public active: boolean
  constructor (delay: number, period: number, task: Task, scheduler: Scheduler) {
    this.time = delay
    this.period = period
    this.task = task
    this.scheduler = scheduler
    this.active = true
  }

  run (): void {
    this.task.run(this.time)
  }

  error (err: Error): void {
    this.task.error(this.time, err)
  }

  dispose (): void {
    this.scheduler.cancel(this)
    return this.task.dispose()
  }
}