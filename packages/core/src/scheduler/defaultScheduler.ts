import { TaskScheduler } from './Scheduler'
import { ClockTimer } from './ClockTimer'
import { BinaryTimeline } from './BinaryTimeline'

export const defaultScheduler = new TaskScheduler(new ClockTimer(), new BinaryTimeline())
