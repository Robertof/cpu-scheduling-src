import { sortByArrivalOrIndex } from '../scheduling'


export default function fcfs (processes) {
  // Sort the processes by their arrival time or their index if the arrival time is equal.
  let processQueue = sortByArrivalOrIndex (processes)
  let simulationResults = []
  let currentlyExecuting
  let currentTime = 0
  for (;;) {
    // Find a process to schedule if we aren't already executing one.
    if (!currentlyExecuting) {
      // The simulation is done if there are no more processes.
      if (!processQueue.length)
        break
      // If the next process in the queue has arrived, dequeue it and start the execution.
      if (currentTime >= processQueue[0].arrival) {
        currentlyExecuting = processQueue.shift()
        currentlyExecuting.startTime = currentTime
      }
    } else if (currentTime >= currentlyExecuting.startTime + currentlyExecuting.duration) {
      // The current process is over.
      currentlyExecuting.endTime = currentTime
      console.log('Execution of %s (startTime = %d, duration = %d, endtime = %d) finished.',
        currentlyExecuting.name, currentlyExecuting.startTime,
        currentlyExecuting.duration, currentTime)
      simulationResults[currentlyExecuting.index] = currentlyExecuting
      currentlyExecuting = null
      continue // Continue without advancing the time.
    }
    ++currentTime
  }
  return simulationResults
}
