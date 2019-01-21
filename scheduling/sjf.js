import {
  sortByArrivalOrIndex,
  markTimeForProcess,
  getLastTimeForProcess,
  START_TIME
} from '../scheduling'

/*
 * TODO: discuss this case with the professor.
 * P# / arrival / duration
 * P1 / 9       / 8
 * P2 / 7       / 8
 * P3 / 6       / 5
 * P4 / 1       / 10
 */
export default function sjf (processes, { isPreemptive = false } = {}) {
  // Sort the processes by their arrival time or their index if the arrival time is equal.
  let remainingProcesses = sortByArrivalOrIndex (processes)
  let processQueue = []
  let simulationResults = []
  let currentTime = 0
  let currentlyExecuting
  const markTime = proc => {
    console.log ('Marked time %d for process %s.', currentTime, proc.name)
    markTimeForProcess (currentTime, proc)
  }
  const endProcess = pendingProcess => {
    markTime (pendingProcess)
    simulationResults[pendingProcess.index] = pendingProcess
    console.log('Execution of %s (startTime = %d, duration = %d, endtime = %d) finished.',
      pendingProcess.name, getLastTimeForProcess (START_TIME, pendingProcess),
      pendingProcess.duration, currentTime)
  }
  while (processQueue.length || remainingProcesses.length) {
    // Iterate for each remaining process.
    for (let i = 0; i < remainingProcesses.length; ++i) {
      const pendingProcess = remainingProcesses[i]
      if (!pendingProcess.remainingTime)
        pendingProcess.remainingTime = pendingProcess.duration
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
      if (isPreemptive && currentlyExecuting) {
        if (processQueue[0].remainingTime < currentlyExecuting.remainingTime) {
          // Preempt.
          let newProcess = processQueue.shift()
          console.log ('Preempting -- suspending process %s and starting %s',
            currentlyExecuting.name, newProcess.name)
          markTime (currentlyExecuting) // mark suspend time
          markTime (newProcess) // mark resume/start time
          processQueue.unshift (currentlyExecuting)
          currentlyExecuting = newProcess
        }
      } else { // Non-preemptive version of the algorithm or nothing is currently running.
        // Dequeue the topmost process.
        let pendingProcess = processQueue.shift()
        markTime (pendingProcess) // mark start time
        // If we're not in preemptive mode, fast forward to the end of the process.
        if (!isPreemptive) {
          currentTime += pendingProcess.remainingTime
          endProcess (pendingProcess) // marks end time
          continue
        }
        else {
          // If we're in preemptive mode, we can't just skip to the end of the process. Execute it
          // until something interesting happens.
          currentlyExecuting = pendingProcess
          const queue = processQueue.length ? processQueue : remainingProcesses
          // If we just have to wait for the next process, advance the time until it arrives.
          let delta
          if (queue.length && (delta = queue[0].arrival > currentTime)) {
            currentlyExecuting.remainingTime -= delta
            currentTime += delta
            continue
          } else if (!queue.length) {
            // If there are no remaining processes, just fast forward to the end of the simulation.
            currentTime += currentlyExecuting.remainingTime
            currentlyExecuting.remainingTime = 0
            // The process will be terminated by the next call to `endProcess`.
          }
        }
      }
    }

    if (currentlyExecuting) {
      if (!currentlyExecuting.remainingTime) {
        // Process finished.
        endProcess (currentlyExecuting)
        currentlyExecuting = null
        continue
      }
      --currentlyExecuting.remainingTime
    }

    ++currentTime
  }
  return simulationResults
}
