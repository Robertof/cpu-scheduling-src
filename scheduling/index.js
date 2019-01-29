import fcfs from './fcfs'
import { sjf, sjfPreemptive } from './sjf'
import roundRobin from './round-robin'

export const START_TIME = 0
export const END_TIME = 1

export default {
  fcfs,
  sjf,
  sjfPreemptive,
  roundRobin
}

export class Process {
  /**
   * Represents the order of arrival of this process, starts from 0.
   */
  index
  /**
   * The name of this process. Usually P[index + 1]
   */
  name
  /**
   * Arrival of this process.
   */
  arrival
  /**
   * Duration of this process.
   */
  duration
  /**
   * Time left for the execution of this process.
   * NOTE: this value is not always reliable, not all schedulers use it.
   */
  timeLeft
  /**
   * Execution time intervals of this process. Execution times are represented as a 2d array
   * containing pairs of start times and end times. The final structure looks like this:
   * ```
   * [ [ startTime, stopTime ], [ resumeTime, stopTime ], ... ]
   * ```
   * @type {Array}
   */
  timeIntervals = [[]]

  constructor ({ index, name, arrival, duration }) {
    if (typeof index !== 'number' ||
        typeof arrival !== 'number' ||
        typeof duration !== 'number' ||
        index < 0 || arrival < 0 || duration <= 0)
      throw 'Process::constructor(): missing/invalid required parameters: index, arrival, duration'
    this.index = index
    this.name = name || `P${index + 1}`
    this.arrival = arrival
    this.duration = this.timeLeft = duration
  }

  get lastTimeInterval() {
    return this.timeIntervals[this.timeIntervals.length - 1]
  }

  /**
   * Marks a new instant into the currently available time interval slot. If no slot is available,
   * a new time interval is created.
   */
  markTime (time) {
    // Find the first time interval in the times table which has an available slot.
    const target = this.timeIntervals.find (t => t.length < 2)
    // If found, push the time.
    if (target)
      target.push (time)
    else // Otherwise, create a new interval.
      this.timeIntervals.push ([ time ])
  }

  addTimeInterval (timeInterval) {
    if (!Array.isArray (timeInterval) || timeInterval.length !== 2)
      throw 'Process::addTimeInterval(): invalid time interval'
    const usedSlots = this.lastTimeInterval.length
    if (usedSlots === 1)
      throw 'Process::addTimeInterval(): can\'t add a time interval when an incomplete one exists'
    else if (!usedSlots)
      // If the last slot is an empty one, get rid of it and add the new one.
      this.timeIntervals.splice (-1, 1, timeInterval)
    else
      // Otherwise, just push it at the end of the array.
      this.timeIntervals.push (timeInterval)
  }

  /**
   * Removes the temporary state associated with the process.
   */
  cleanup() {
    this.timeIntervals = [[]]
    this.timeLeft = this.duration
  }

  /**
   * A fancy name for a function which returns a subset of the process info along with
   * collected time intervals and cleans up the process state.
   */
  getSimulationResults() {
    const timeIntervals = this.timeIntervals
    this.cleanup()
    return {
      name: this.name,
      arrival: this.arrival,
      duration: this.duration,
      timeIntervals
    }
  }

  toString() {
    const intervals = this.timeIntervals.map (i => `[${i.join (', ')}]`).join (', ')
    return `${this.name}[arrival=${this.arrival}, duration=${this.duration}, ` +
      `intervals=[${intervals}]]`
  }
}

export function sortByArrivalOrIndex (processes) {
  return processes.slice().sort ((a, b) => {
    let cmp = a.arrival - b.arrival
    if (!cmp)
      return a.index - b.index
    return cmp
  })
}
