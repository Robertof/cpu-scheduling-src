import fcfs from './fcfs'
import sjf from './sjf'

export default {
  fcfs,
  sjf
}

export function sortByArrivalOrIndex (processes) {
  return processes.slice().sort ((a, b) => {
    let cmp = a.arrival - b.arrival
    if (!cmp)
      return a.index - b.index
    return cmp
  })
}
