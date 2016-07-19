import { Task } from '../interfaces'

export class MulticastTask implements Task {
  private _run: () => any
  private active: boolean
  constructor (run: () => any) {
    this._run = run
    this.active = true
  }

  static create (run: () => any) {
    return new MulticastTask(run)
  }

  run (time: number): void {
    if (!this.active) return
    this._run()
  }

  error (time: number, err: Error): void {
    return void 0
  }

  dispose (): void {
    this.active = false
  }
}