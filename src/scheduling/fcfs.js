import { sortByArrivalOrIndex } from '../scheduling'

function fcfs (processes) {
  // Sort the processes by their arrival time or their index if the arrival time is equal.
  let processQueue = sortByArrivalOrIndex (processes)
  let simulationResults = []
  let currentTime = 0
  while (processQueue.length) {
    // Find a process to schedule if we aren't already executing one.
    if (currentTime >= processQueue[0].arrival) {
      // Dequeue the topmost process.
      let pendingProcess = processQueue.shift()
      // Fast forward to its end and push the time interval corresponding to the execution time.
      pendingProcess.addTimeInterval ([currentTime, currentTime + pendingProcess.duration])
      currentTime += pendingProcess.duration
      console.log('Execution of %s finished at %d.', pendingProcess.toString(), currentTime)
      simulationResults[pendingProcess.index] = pendingProcess.getSimulationResults()
      continue // Continue without advancing the time.
    }
    ++currentTime
  }
  return simulationResults
}

fcfs.metadata = {
  name: 'FCFS (First-Come, First-Served)',
  tooltip: `
    Questo algoritmo esegue per primi i processi che arrivano per primi, lavorando come una lista
    FIFO (first-in, first-out).
  `
}

export default fcfs
