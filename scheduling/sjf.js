import { sortByArrivalOrIndex } from '../scheduling'

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
  const endProcess = pendingProcess => {
    pendingProcess.markTime (currentTime)
    console.log('Execution of %s finished at time %d.', pendingProcess.toString(), currentTime)
    simulationResults[pendingProcess.index] = pendingProcess.getSimulationResults()
  }
  while (processQueue.length || remainingProcesses.length) {
    // Iterate for each remaining process.
    for (let i = 0; i < remainingProcesses.length; ++i) {
      const pendingProcess = remainingProcesses[i]
      // If this pending process has arrived and we either:
      // a) don't have any process currently scheduled
      // b) this pending process has a shorter duration than the currently scheduled one
      // Then we remove this pending process from the list and put it on top of the main queue.
      if (currentTime >= pendingProcess.arrival &&
         (!processQueue.length || pendingProcess.timeLeft < processQueue[0].timeLeft)) {
        processQueue.unshift (remainingProcesses.splice (i, 1)[0])
        // Update the index once the element has been removed.
        --i
      }
    }

    // Find a process to schedule if we aren't already executing one.
    if (processQueue.length && currentTime >= processQueue[0].arrival) {
      if (isPreemptive && currentlyExecuting) {
        if (processQueue[0].timeLeft < currentlyExecuting.timeLeft) {
          // Preempt.
          let newProcess = processQueue.shift()
          currentlyExecuting.markTime (currentTime) // mark suspend time
          newProcess.markTime (currentTime) // mark resume/start time
          console.log ('Preempting -- suspending process %s and starting %s at time %d',
            currentlyExecuting.toString(), newProcess.toString(), currentTime)
          // Put the currently executing process back in the queue as the first candidate to be
          // executed.
          let insertAt = processQueue.findIndex (q => q.timeLeft >= currentlyExecuting.timeLeft)
          if (insertAt > -1)
            processQueue.splice (insertAt, 0, currentlyExecuting)
          else
            processQueue.push (currentlyExecuting)
          // Execute the new process.
          currentlyExecuting = newProcess
        }
      } else { // Non-preemptive version of the algorithm or nothing is currently running.
        // Dequeue the topmost process.
        let pendingProcess = processQueue.shift()
        pendingProcess.markTime (currentTime) // mark start time
        // If we're not in preemptive mode, fast forward to the end of the process.
        if (!isPreemptive) {
          currentTime += pendingProcess.timeLeft
          endProcess (pendingProcess) // marks end time
          continue
        }
        else {
          // If we're in preemptive mode, we can't just skip to the end of the process.
          // Start the execution of the new process.
          currentlyExecuting = pendingProcess
          const queue = processQueue.length ? processQueue : remainingProcesses
          let delta = queue.length ?
            Math.min (currentlyExecuting.timeLeft, queue[0].arrival - currentTime) :
            0
          // If there are any processes left in the queue which still have to arrive, fast forward
          // until their arrival.
          if (delta > 0) {
            console.log ('Fast forwarding execution of %s by %d time unit(s).',
              currentlyExecuting.toString(), delta)
            currentlyExecuting.timeLeft -= delta
            if (currentlyExecuting.timeLeft < 0)
              throw `Process ${currentlyExecuting} has timeLeft < 0. This should never happen!`
            currentTime += delta
            continue
          } else if (!queue.length) {
            // If there are no remaining processes, just fast forward to the end of the simulation.
            currentTime += currentlyExecuting.timeLeft
            currentlyExecuting.timeLeft = 0
            // The process will be terminated by the next call to `endProcess`.
          }
        }
      }
    }

    if (currentlyExecuting) {
      if (!currentlyExecuting.timeLeft) {
        // Process finished.
        endProcess (currentlyExecuting)
        currentlyExecuting = null
        continue
      }
      --currentlyExecuting.timeLeft
    }

    ++currentTime
  }
  return simulationResults
}
