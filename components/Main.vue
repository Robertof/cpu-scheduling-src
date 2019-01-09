<template lang="pug">
.main-container
  header.bg-1
    h1
      i.fas.fa-microchip
      | Scheduling CPU
    em
      | Realizzato da
      i.fas.fa-pencil-alt
      | #[span Roberto Frenna]
      | – docente
      i.fas.fa-graduation-cap
      | #[span Walter Balzano] – corso di
      i.fas.fa-university
      | #[span Sistemi Operativi]
  section.configuration.bg-2.with-border-top
    i.fas.fa-cog
    span.section-name Configurazione
    ul
      li
        | Numero processi:
        select(v-model="numberOfProcesses")
          each num in [...Array(5).keys()]
            option= num + 2
      li
        i.fas.fa-redo.regenerate-button(@click="generateProcesses ({ fromScratch: true })")
      li
        i.fas.fa-play.simulate-button(@click="simulate")
    span(v-if="false") } // fixes syntax highlighting in sublime text
    .row.process-config
      .col-sm(v-for="(process, n) in processes")
        span.process-name
          | #[i.fas.fa-stopwatch] {{ process.name }}
        .row
          .col: label(:for="'arrival-p' + n") Arrivo:
          .col
            input(type="number" min="0" max="50" v-model.number="process.arrival" :id="'arrival-p' + n")
        .row
          .col: label(:for="'duration-p' + n") Durata:
          .col
            input(type="number" min="0" max="20" v-model.number="process.duration" :id="'duration-p' + n")
            .spacer
  section.scheduling-algorithm.bg-1.with-border-top
    | #[i.fas.fa-chevron-circle-right] FCFS (first-come, first-served)
  .chart-container.fcfs: div(ref="fcfs")
</template>

<style lang="scss">
@import '~@fortawesome/fontawesome-free/css/all.css';
body {
  margin: 0;
  color: #212529;
}
.main-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
  // non selectable items
  header, .configuration {
    :not(input):not(textarea) {
      -webkit-user-select: none;
      user-select: none;
      cursor: default;
    }
  }
  .bg-1.with-border-top, .bg-2.with-border-top {
    border-top: 1px #3f464f solid;
  }
  .bg-1 {
    background-color: #343a40;
  }
  .bg-2 {
    background-color: #2d3238;
  }
  header {
    width: 100%;
    color: #fff;
    padding: 8px;
    i {
      margin-right: 8px;
    }
    h1, em {
      vertical-align: middle;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: bold;
      display: inline;
      margin-right: 10px;
      font-variant: small-caps;
    }
    em {
      i {
        margin: 0 4px;
      }
      span {
        color: #70beff;
        font-weight: bold;
      }
    }
  }

  .configuration {
    padding: 8px;
    padding-bottom: 0;
    color: #fff;
    span, ul, i {
      vertical-align: middle;
    }
    & > i {
      margin-right: 4px;
      margin-top: 2px;
    }
    .section-name {
      text-transform: uppercase;
      font-weight: bold;
    }
    ul {
      padding: 0;
      list-style-position: outside;
    }
    li:before {
      content: ">";
      font-weight: bold;
      margin: 0 8px;
    }
    ul, li {
      display: inline;
      list-style-type: none;
    }
    select {
      margin-left: 4px;
    }
    .regenerate-button {
      color: #70beff;
      cursor: pointer;
    }
    .simulate-button {
      color: lightgreen;
      cursor: pointer;
    }
    .process-config {
      text-align: center;
      margin-top: 8px;
      .process-name {
        font-weight: bold;
        margin-top: 4px;
        display: inline-block;
        color: #fbff8c;
        .fas {
          vertical-align: baseline;
          color: #fcffaa;
        }
      }
      & > [class^="col-"] {
        border-right: 1px white solid;
        border-top: 1px white solid;
      }
      input[type="number"] {
        background-color: transparent;
        border: 0;
        border-bottom: 1px white dotted;
        color: #fff;
        width: 2rem;
        font-size: inherit;
        margin-left: 4px;
      }
      .spacer {
        padding-bottom: 8px;
      }
    }
  }

  .scheduling-algorithm {
    color: #fff;
    padding: 4px;
    font-size: 1rem;
  }

  .chart-container {
    padding: 8px;
  }
}
</style>

<script>
import TimelinesChart from 'timelines-chart'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

const schedulingAlgorithms = {
  fcfs (processes) {
    // Sort the processes by their arrival time or their index if the arrival time is equal.
    let processQueue = processes.slice().sort ((a, b) => {
      let cmp = a.arrival - b.arrival
      if (!cmp)
        return a.index - b.index
      return cmp
    })
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
        simulationResults.push (currentlyExecuting)
        currentlyExecuting = null
        continue // Continue without advancing the time.
      }
      ++currentTime
    }
    return simulationResults.sort ((a, b) => a.index - b.index)
  }
}

// Adapts data returned from schedulers for use with the charting library.
function adaptData (simulationResults) {
  return [{
    group: '',
    data: simulationResults.map (p => {
      let data = [{
        timeRange: [p.startTime, p.endTime],
        val: 'Esecuzione ' + p.name
      }]
      // If the process start time isn't equal to its arrival, add an additional segment to the
      // graph corresponding to its arrival time.
      if (p.startTime !== p.arrival)
        data.unshift ({
          timeRange: [p.arrival, p.arrival],
          val: 'Arrivo ' + p.name
        })
      return {
        label: p.name,
        data
      }
    })
  }]
}

export default {
  name: 'homepage',
  data() {
    return {
      numberOfProcesses: 4,
      processes: [],
      timelines: {}
    }
  },
  methods: {
    generateProcesses ({ fromScratch } = {}) {
      if (fromScratch && this.processes.length)
        this.processes.length = 0
      for (let i = this.processes.length; i < this.numberOfProcesses; ++i) {
        this.processes.push ({
          name: 'P' + (i + 1),
          index: i,
          arrival: getRandomInt (0, 16),
          duration: getRandomInt (1, 11)
        })
      }
    },
    simulate () {
      // Testing the FCFS scheduling algorithm.
      let results = schedulingAlgorithms.fcfs (this.processes)
      // Create the TimelinesChart object with the required configuration parameters.
      if (!this.timelines.fcfs)
        this.timelines.fcfs = TimelinesChart()(this.$refs.fcfs)
          .enableOverview (false)
          .xTickFormat (n => +n) // This is used to create our custom time scale without date units
          .timeFormat ('%Q')
          .zQualitative (true)
      // This is sort of an hack. D3 uses different colors for the arrival and start time of
      // processes, which doesn't look very good on the chart. To solve this, we retrieve the
      // old color scale used by TimelinesChart and we pass to the original scale only the process
      // name (P1, P2, P3, ...) instead of all the string ("Esecuzione P1", ...).
      let oldScale = this.timelines.fcfs.zColorScale()
      let newScale = v => oldScale (v.split (' ').pop())
      newScale.domain = oldScale.domain
      newScale.range = oldScale.range
      newScale.unknown = oldScale.unknown
      newScale.copy = oldScale.copy
      // Finally pass the adapted data to TimelinesChart.
      this.timelines.fcfs
        .zColorScale(newScale)
        .data (adaptData (results))
    }
  },
  watch: {
    numberOfProcesses (newValue, oldValue) {
      newValue = parseInt (newValue, 10)
      oldValue = parseInt (oldValue, 10)
      if (newValue < oldValue) { // user removed some processes from the list
        const delta = oldValue - newValue
        this.processes.splice (-delta, delta)
      } else
        this.generateProcesses()
    }
  },
  mounted() {
    this.generateProcesses()
  }

}
</script>
