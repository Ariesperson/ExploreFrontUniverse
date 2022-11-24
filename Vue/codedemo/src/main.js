import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  data() {
    return {
      worldname:'中世纪'
    }
  },
  render: h => h(App),
}).$mount('#app')
