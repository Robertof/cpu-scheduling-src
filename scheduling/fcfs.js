import { sortByArrivalOrIndex, markTimeForProcess } from '../scheduling'

export default function fcfs (processes) {
  // Sort the processes by their arrival time or their index if the arrival time is equal.
  let processQueue = sortByArrivalOrIndex (processes)
  let simulationResults = []
  let currentTime = 0
  while (processQueue.length) {
    // Find a process to schedule if we aren't already executing one.
    if (currentTime >= processQueue[0].arrival) {
      // Dequeue the topmost process.
      let pendingProcess = processQueue.shift()
      markTimeForProcess (currentTime, pendingProcess)
      // Fast forward to its end.
      currentTime += pendingProcess.duration
      markTimeForProcess (currentTime, pendingProcess)
      simulationResults[pendingProcess.index] = pendingProcess
      console.log('Execution of %s (startTime = %d, duration = %d, endtime = %d) finished.',
        pendingProcess.name, pendingProcess.startTime,
        pendingProcess.duration, currentTime)
      continue // Continue without advancing the time.
    }
    ++currentTime
  }
  return simulationResults
}
