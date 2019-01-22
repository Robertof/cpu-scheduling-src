import Vue from 'vue'
//import BootstrapVue from 'bootstrap-vue'
import App from './App'
import VTooltip from 'v-tooltip'
import 'bootstrap/dist/css/bootstrap-grid.css'
//import 'bootstrap-vue/dist/bootstrap-vue.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

//Vue.use(BootstrapVue)
Vue.use (VTooltip)

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
