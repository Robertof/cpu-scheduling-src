import { sortByArrivalOrIndex } from '..'
import InlineSettings from './InlineSettings'

/*
 * TODO: discuss this case with the professor.
 * 13 10
 * 11 5
 * 5 12
 * 3 9
 */
function roundRobin (processes, { quantum: maxCpuTime = 3 } = {}) {
  // Sort the processes by their arrival time or their index if the arrival time is equal.
  let processQueue = sortByArrivalOrIndex (processes)
  let simulationResults = []
  // Start simulating when the first process arrives.
  let currentTime = processQueue[0].arrival
  while (processQueue.length) {
    // Dequeue the topmost process.
    let pendingProcess = processQueue.shift()
    pendingProcess.markTime (currentTime) // mark begin/resume time
    // Determine the allowed execution time for this process. In the base case, this process
    // receives the maximum allowed CPU execution time (the quantum).
    let executionTime = maxCpuTime
    // First case: if the next process in the queue still hasn't arrived, then proceed to fast
    // forward the execution of this process until someone arrives.
    if (processQueue.length && currentTime < processQueue[0].arrival)
      executionTime = Math.max (
        // To determine how much to fast forward, we choose the biggest value between the quantum
        // itself...
        maxCpuTime,
        // ...or how many times the quantum fits between the arrival time of the next process and
        // the arrival time of the dequeued process, multiplied by the quantum itself.
        // For example, if the next process arrives at t = 5 and we're at t = 1 (with q = 3), our
        // execution time is 3 * ceil(4 / 3) = 3 * 2 = 6 time units.
        maxCpuTime * Math.ceil ((processQueue[0].arrival - pendingProcess.arrival) / maxCpuTime)
      )
    // Second and last case: if there is no other process left in the queue, just use the remaining
    // time of this process as the execution time.
    else if (!processQueue.length)
      executionTime = pendingProcess.timeLeft
    // Make sure the actual execution time isn't bigger than the remaining duration of the process.
    executionTime = Math.min (pendingProcess.timeLeft, executionTime)
    // Advance the time.
    pendingProcess.timeLeft -= executionTime
    currentTime += executionTime
    pendingProcess.markTime (currentTime)
    // If the process still has work to do, then put it back in the queue.
    if (pendingProcess.timeLeft) {
      // We put the process before any process that still has to arrive. If there's no such
      // process, then it is pushed at the end of the queue.
      const insertAt = processQueue.findIndex (p => currentTime < p.arrival)
      if (insertAt > -1)
        processQueue.splice (insertAt, 0, pendingProcess)
      else
        processQueue.push (pendingProcess)
    } else {
      // The process is done.
      console.log('Execution of %s finished at %d.', pendingProcess.toString(), currentTime)
      simulationResults[pendingProcess.index] = pendingProcess.getSimulationResults()
    }
    // If the next process still has to arrive, fast forward to its arrival.
    if (processQueue.length && currentTime < processQueue[0].arrival)
      currentTime = processQueue[0].arrival 
  }
  return simulationResults
}

roundRobin.metadata = {
  name: 'Round Robin',
  tooltip: `
    Il round robin è un algoritmo largamente usato nel mondo reale e uno dei più pratici e semplici
    da implementare. L'algoritmo alloca a ciascun processo un tempo fisso di esecuzione detto
    "quantum" o più semplicemente "q", avvalendosi della capacità di prelazione per sospendere il
    processo attualmente in esecuzione una volta superato il tempo massimo ed eseguire il
    successivo nella coda. Il round robin non presenta il problema della starvation.
  `,
  components: {
    inlineSettings: InlineSettings
  }
}

export default roundRobin
