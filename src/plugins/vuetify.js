import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#38414a',
        secondary: '#ff5722',
        accent: '#2196f3',
        error: '#f44336',
        warning: '#ff9800',
        info: '#009688',
        success: '#4caf50',
      },
    },
  },
})
