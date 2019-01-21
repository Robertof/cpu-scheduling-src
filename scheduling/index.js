import fcfs from './fcfs'
import sjf from './sjf'

export const START_TIME = 0
export const END_TIME = 1

export default {
  fcfs,
  sjf,
  sjfPreemptive: processes => sjf (processes, { isPreemptive: true })
}

export function sortByArrivalOrIndex (processes) {
  return processes.slice().sort ((a, b) => {
    let cmp = a.arrival - b.arrival
    if (!cmp)
      return a.index - b.index
    return cmp
  })
}

export function markTimeForProcess (time, proc) {
  if (!proc.times)
    proc.times = [[]]
  // Find the first time interval in the times table which has an available slot.
  let target = proc.times.find (t => t.length < 2)
  // If found, push the time.
  if (target)
    target.push (time)
  else // Otherwise, create a new interval.
    proc.times.push ([ time ])
}

export function getLastTimeForProcess (time, proc) {
  return proc.times[proc.times.length - 1][time]
}
