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
  transition(name="fade" mode="out-in" @enter="simulate")
    h1.not-generated-yet.bg-1(v-if="!hasSimulated")
      | Premi sul tasto #[i.fas.fa-play.simulate-button(@click="simulate")] per iniziare la simulazione.
    div(v-else)
      template(v-for="(algorithm, codename, index) in schedulingAlgorithms")
        section.scheduling-algorithm(:class=`{
          'with-border-top': !index,
          'bg-1': !(index % 2),
          'bg-2': !!(index % 2)
        }`)
          .algorithm-name-container
            | #[i.fas.fa-chevron-circle-right] 
            span.algorithm-name(v-tooltip="algorithm.metadata.tooltip") {{ algorithm.metadata.name }}
          // TODO .algorithm-props X
          .clearfix
        .chart-container(:class="codename")
          div(:ref="codename")
</template>

<style lang="scss">
@import '~@fortawesome/fontawesome-free/css/all.css';
body {
  margin: 0;
  color: #212529;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
}
#app, .main-container {
  height: 100%;
}
.main-container {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  // non selectable items
  header, section {
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
    color: #fff;
  }
  .bg-2 {
    background-color: #2d3238;
    color: #fff;
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
    .algorithm-name-container {
      float: left;
      .algorithm-name {
        user-select: none;
        cursor: help;
        border-bottom: 1px white dotted;
      }
    }
    .algorithm-props {
      float: right;
    }
    .clearfix {
      clear: both;
    }
  }

  .chart-container {
    padding: 8px;
  }

  .not-generated-yet {
    justify-content: center;
    align-items: center;
    align-content: center;
    flex-wrap: wrap;
    display: flex;
    flex: 1;
    margin: 0;
    border-top: 1px white solid;
    user-select: none;
    cursor: default;
    i {
      color: lightgreen;
      cursor: pointer;
      margin: 0 .7rem;
    }
  }

  // vuejs animation classes
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
}

 // tooltips
.tooltip {
  display: block !important;
  z-index: 10000;
 
  .tooltip-inner {
    background: rgba(#004499, .9);
    color: white;
    border-radius: 5px;
    padding: 16px;
    max-width: 40vw;
    box-shadow: 0 5px 30px rgba(black, .1);
  }
 
  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: rgba(#004499, .9);
    z-index: 1;
  }
 
  &[x-placement^="top"] {
    margin-bottom: 5px;
 
    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }
 
  &[x-placement^="bottom"] {
    margin-top: 5px;
 
    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }
 
  &[x-placement^="right"] {
    margin-left: 5px;
 
    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }
 
  &[x-placement^="left"] {
    margin-right: 5px;
 
    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }
 
  &.popover {
    $color: #f9f9f9;
 
    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, .1);
    }
 
    .popover-arrow {
      border-color: $color;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }
 
  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
}
</style>

<script>
import TimelinesChart from 'timelines-chart'
import schedulingAlgorithms, { Process, START_TIME, END_TIME } from '../scheduling'
import debounce from 'lodash/debounce'

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

// Adapts data returned from schedulers for use with the charting library.
function adaptData (simulationResults) {
  return [{
    group: '',
    data: simulationResults.map (p => {
      let data = p.timeIntervals.map (time => ({
        timeRange: [time[START_TIME], time[END_TIME]],
        val: 'Esecuzione ' + p.name
      }))
      // If the process start time isn't equal to its arrival, add an additional segment to the
      // graph corresponding to its arrival time.
      if (p.timeIntervals[0][START_TIME] !== p.arrival)
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

let adjustedColorScale

export default {
  name: 'homepage',
  data() {
    return {
      numberOfProcesses: 4,
      processes: [],
      timelines: {},
      hasSimulated: false
    }
  },
  computed: {
    schedulingAlgorithms: () => schedulingAlgorithms
  },
  methods: {
    generateProcesses ({ fromScratch } = {}) {
      if (fromScratch && this.processes.length)
        this.processes.length = 0
      for (let i = this.processes.length; i < this.numberOfProcesses; ++i) {
        this.processes.push (new Process ({
          index: i,
          arrival: getRandomInt (0, 16),
          duration: getRandomInt (1, 11)
        }))
      }
    },
    simulate() {
      if (!this.hasSimulated) {
        this.hasSimulated = true
        // This triggers a re-render which actually makes available the different containers for
        // the charts. Since the transition is animated, an event automatically calls 'simulate'
        // again when the animations are done and the container elements are available. There's
        // nothing more to do in this case.
        // TODO: a possible optimization is to pre-compute the results of the different simulations
        // until the DOM elements are available to render the charts.
        return
      }
      for (let algorithm in schedulingAlgorithms) {
        console.time (algorithm)
        let results = schedulingAlgorithms[algorithm](this.processes)
        console.timeEnd (algorithm)
        // Create the TimelinesChart object with the required configuration parameters.
        if (!this.timelines[algorithm])
          this.timelines[algorithm] = TimelinesChart()(this.$refs[algorithm][0])
            .enableOverview (false)
            .xTickFormat (n => +n) // This is used to create our custom time scale without date units
            .timeFormat ('%Q')
            .zQualitative (true)
        if (!adjustedColorScale) {
          // This is sort of an hack. D3 uses different colors for the arrival and start time of
          // processes, which doesn't look very good on the chart. To solve this, we retrieve the
          // old color scale used by TimelinesChart and we pass to the original scale only the
          // process name (P1, P2, P3, ...) instead of all the string ("Esecuzione P1", ...).
          let oldScale = this.timelines[algorithm].zColorScale()
          adjustedColorScale = v => oldScale (v.split (' ').pop())
          adjustedColorScale.domain = oldScale.domain
          adjustedColorScale.range = oldScale.range
          adjustedColorScale.unknown = oldScale.unknown
          adjustedColorScale.copy = oldScale.copy
        }
        // Finally pass the adapted data to TimelinesChart.
        this.timelines[algorithm]
          .zColorScale (adjustedColorScale)
          .data (adaptData (results))
      }
    },
    onWindowResized: debounce (function() {
      for (let chartName in this.timelines)
        this.timelines[chartName].width (window.innerWidth)
    }, 150)
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
    window.addEventListener ('resize', this.onWindowResized)
  },
  beforeDestroy() {
    window.removeEventListener ('resize', this.onWindowResized)
  }
}
</script>
