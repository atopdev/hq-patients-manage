import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import vuetify from './plugins/vuetify'
import { store } from './store'
import router from './router'
import i18n from './helpers/i18n'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false
Vue.use(VueRouter)

new Vue({
  vuetify,
  store,
  router,
  i18n,
  render: (h) => h(App),
}).$mount('#app')
