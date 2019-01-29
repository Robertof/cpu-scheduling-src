<template lang="pug">
span.round-robin-cfg(v-tooltip=`
  'Il parametro "q" (quantum) indica la quantità di tempo del processore allocata ad ogni ' +
  'processo. Per valori grandi di "q", il round robin si comporta come il FCFS.'
`)
  span q =
  |
  |
  input(type="number" min="0" max="100" v-model.number="quantum")
</template>

<style lang="scss">
.round-robin-cfg {
  span {
    border-bottom: 1px white dotted;
    cursor: help !important;
  }
}
</style>

<script>
export default {
  data() {
    return {
      quantum: 3
    }
  },
  watch: {
    quantum (newValue) {
      this.$emit ('config-changed', { quantum: newValue })
    }
  }
}
</script>
