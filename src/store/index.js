import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    user: null,
    report: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setReport(state, data) {
      state.report = data
    },
  },
  getters: {
    // getter functions are called like:
    // this.$store.getters.someVal
    user: (state) => state.user,
    report: (state) => state.report,
  },
})
