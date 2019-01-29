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
        i.fas.fa-redo.regenerate-button(
          @click="generateProcesses ({ fromScratch: true })"
          v-tooltip="{ content: 'Rigenera dati', classes: ['small'] }"
        )
      li
        i.fas.fa-play.simulate-button(
          @click="simulateAll"
          v-tooltip="{ content: 'Inizia simulazione', classes: ['small'] }"
        )
    span(v-if="false") } // fixes syntax highlighting in sublime text
    .row.process-config
      .col-sm(v-for="(process, n) in processes")
        span.process-name
          | #[i.fas.fa-stopwatch] {{ process.name }}
        .row
          .col: label(:for="'arrival-p' + n") Arrivo:
          .col
            input(
              type="number" min="0" max="50"
              v-model.number="process.arrival" :id="'arrival-p' + n"
            )
        .row
          .col: label(:for="'duration-p' + n") Durata:
          .col
            input(
              type="number" min="0" max="20"
              v-model.number="process.duration" :id="'duration-p' + n"
            )
            .spacer
  transition(name="fade" mode="out-in" @enter="simulateAll")
    h1.not-generated-yet.bg-1(v-if="!hasSimulated").
      Premi sul tasto #[i.fas.fa-play.simulate-button(@click="simulateAll")]
      per iniziare la simulazione.
    div(v-else)
      //- schedulerData is pre-filled with the available algorithm names.
      template(v-for="(data, algorithmName, index) in schedulerData")
        //- To ease access to the single algorithm's metadata, which is in another object, we
        //- use a passthrough component which binds the "metadata" variable in a slot scope, which
        //- greatly simplifies its access.
        Passthrough(:metadata="schedulingAlgorithms[algorithmName].metadata")
          section.scheduling-algorithm(
            slot-scope="{ metadata }"
            :class=`{
              'with-border-top': !index,
              'bg-1': !(index % 2),
              'bg-2': !!(index % 2)
            }`
          )
            .algorithm-name-container
              | #[i.fas.fa-chevron-circle-right] 
              span.algorithm-name(v-tooltip="metadata.tooltip")
                | {{ metadata.name }}
            .algorithm-props
              ul
                li.component-settings(v-if="metadata.components && metadata.components.inlineSettings")
                  component(
                    :is="metadata.components.inlineSettings"
                    @config-changed="onSchedulerConfigurationChanged (algorithmName, $event)"
                  )
                li.average-waiting-time(
                  v-if="data && 'averageWaitingTime' in data"
                  v-tooltip=`{
                    content: 'Tempo di attesa medio per i processi',
                    classes: ['small']
                  }`
                )
                  | #[i.fas.fa-clock] #[span {{ data.averageWaitingTime.toLocaleString() }}]
            .clearfix
        .chart-container(:class="algorithmName")
          div(:ref="algorithmName")
</template>

<style lang="scss">
@import '~@fortawesome/fontawesome-free/css/all.css';
body {
  margin: 0;
  color: #212529;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
}
body, #app, .main-container {
  min-height: 100vh;
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
  .bg-1, .bg-2 {
    color: #fff;
    &.with-border-top {
      border-top: 1px #3f464f solid;
    }
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
      ul, li {
        display: inline;
        list-style-type: none;
      }
      li:not(:last-child):after {
        content: "\200b"; // zero width space
        width: 1px;
        background-color: #fff;
        display: inline-block;
        margin: 0 10px;
      }
      i {
        margin-right: 2px;
      }
      .average-waiting-time {
        &, span, i {
          cursor: help;
        }
        span {
          border-bottom: 1px white dotted;
          user-select: auto;
        }
      }
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

  &.small .tooltip-inner {
    padding: 5px 10px 4px;
  }
 
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
import fromPairs from 'lodash/fromPairs'

// Pass-through component to allow easy mounting of pre-computed values.
// Cheers to https://dev.to/loilo92/an-approach-to-vuejs-template-variables-5aik
const Passthrough = {
  render() {
    return this.$scopedSlots.default (this.$attrs)
  }
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

// Adapts data returned from schedulers for use with the charting library.
// This also calculates the average waiting time.
function processSimulationResults (simulationResults) {
  let waitingTimes = 0
  const adaptedData = [{
    group: '',
    data: simulationResults.map (p => {
      // Calculate the waiting time for this process.
      // t = end_time - duration - arrival
      waitingTimes += p.timeIntervals[p.timeIntervals.length-1][END_TIME] - p.duration - p.arrival
      let data = p.timeIntervals.map (time => ({
        timeRange: [time[START_TIME], time[END_TIME]],
        val: 'Esecuzione ' + p.name
      }))
      // If the process start time isn't equal to its arrival, add an additional segment to the
      // chart corresponding to its arrival time.
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
  return {
    adaptedData,
    averageWaitingTime: waitingTimes / simulationResults.length // (w1 + w2 + wn) / n
  }
}

let adjustedColorScale

export default {
  name: 'homepage',
  components: { Passthrough },
  data() {
    return {
      numberOfProcesses: 4,
      processes: [],
      // Contains miscellaneous data about single algorithms, such as the timeline objects, config
      // options, waiting times, ...
      // The object is pre-populated with a basic structure of `{ alg_name: {} }` to allow proper
      // pre-rendering of the DOM.
      schedulerData: fromPairs (Object.keys (schedulingAlgorithms).map (k => [k, {}])),
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
    simulate (algorithm) {
      const context = this.schedulerData[algorithm]
      console.time (algorithm)
      let results = schedulingAlgorithms[algorithm](this.processes, context.config)
      console.timeEnd (algorithm)
      // Create the TimelinesChart object with the required configuration parameters.
      if (!('timeline' in context))
        context.timeline = TimelinesChart()(this.$refs[algorithm][0])
          .enableOverview (false)
          .xTickFormat (n => +n) // Used to create our custom time scale without date units
          .timeFormat ('%Q')
          .zQualitative (true)
      if (!adjustedColorScale) {
        // This is sort of an hack. D3 uses different colors for the arrival and start time of
        // processes, which doesn't look very good on the chart. To solve this, we retrieve the
        // old color scale used by TimelinesChart and we pass to the original scale only the
        // process name (P1, P2, P3, ...) instead of all the string ("Esecuzione P1", ...).
        let oldScale = context.timeline.zColorScale()
        adjustedColorScale = v => oldScale (v.split (' ').pop())
        adjustedColorScale.domain = oldScale.domain
        adjustedColorScale.range = oldScale.range
        adjustedColorScale.unknown = oldScale.unknown
        adjustedColorScale.copy = oldScale.copy
      }
      // Adapt the data in a format suitable for the chart and calculate the average waiting time
      const { averageWaitingTime, adaptedData } = processSimulationResults (results)
      this.$set (context, 'averageWaitingTime', averageWaitingTime)
      // Finally pass the adapted data to TimelinesChart.
      context.timeline
        .zColorScale (adjustedColorScale)
        .data (adaptedData)
    },
    simulateAll() {
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
        this.simulate (algorithm)
      }
    },
    onSchedulerConfigurationChanged (scheduler, newConfiguration) {
      this.schedulerData[scheduler].config = newConfiguration
      this.simulate (scheduler)
    },
    onWindowResized: debounce (function() {
      for (let algorithmName in this.schedulerData)
        this.schedulerData[algorithmName].timeline &&
          this.schedulerData[algorithmName].timeline.width (window.innerWidth)
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
