import { sortByArrivalOrIndex } from '../scheduling'

/*
 * TODO: discuss this case with the professor.
 * P# / arrival / duration
 * P1 / 9       / 8
 * P2 / 7       / 8
 * P3 / 6       / 5
 * P4 / 1       / 10
 */
export default function sjf (processes) {
  // Sort the processes by their arrival time or their index if the arrival time is equal.
  let remainingProcesses = sortByArrivalOrIndex (processes)
  let processQueue = []
  let simulationResults = []
  let currentTime = 0
  while (processQueue.length || remainingProcesses.length) {
    // Iterate for each remaining process.
    for (let i = 0; i < remainingProcesses.length; ++i) {
      const pendingProcess = remainingProcesses[i]
      // If this pending process has arrived and we either:
      // a) don't have any process currently scheduled
      // b) this pending process has a shorter duration than the currently scheduled one
      // Then we remove this pending process from the list and put it on top of the main queue.
      if (currentTime >= pendingProcess.arrival &&
         (!processQueue.length || pendingProcess.duration < processQueue[0].duration)) {
        processQueue.unshift (remainingProcesses.splice (i, 1)[0])
        // Update the index once the element has been removed.
        --i
      }
    }
    // Find a process to schedule if we aren't already executing one.
    if (processQueue.length && currentTime >= processQueue[0].arrival) {
      // Dequeue the topmost process.
      let pendingProcess = processQueue.shift()
      pendingProcess.startTime = currentTime
      // Fast forward to its end.
      currentTime += pendingProcess.duration
      pendingProcess.endTime = currentTime
      simulationResults[pendingProcess.index] = pendingProcess
      console.log('Execution of %s (startTime = %d, duration = %d, endtime = %d) finished.',
        pendingProcess.name, pendingProcess.startTime,
        pendingProcess.duration, currentTime)
      continue
    }
    ++currentTime
  }
  return simulationResults
}
