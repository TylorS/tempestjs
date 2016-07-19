import { Task, ScheduledTask } from '../interfaces'

export function defer (task: Task): Promise<void> {
  return Promise.resolve(task).then(runTask)
}

export function runTask (task: Task): void {
  try {
    return task.run(Date.now())
  } catch (e) {
    return task.error(Date.now(), e)
  }
}

export function runScheduledTask (task: ScheduledTask): void {
  try {
    task.run()
  } catch (e) {
    task.error(e)
  }
}