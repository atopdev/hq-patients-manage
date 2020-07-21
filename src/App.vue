<template>
  <v-app>
    <component v-bind:is="layout"></component>
  </v-app>
</template>

<script>
import DashboardLayout from './layouts/DashboardLayout'
import SimpleLayout from './layouts/SimpleLayout'
import PortalLayout from './layouts/PatientUserPortalLayout'

const defaultLayout = 'simple'

export default {
  created: function () {
    // for(var route of this.$router.options.routes) {
    //   console.log(route)
    //   this.$store.commit('setLayoutsMapping', ['11', '22'])
    // }
  },
  computed: {
    layout() {
      return (this.$route.meta.layout || defaultLayout) + '-layout'
    },
  },
  watch: {
    $route(to) {
      document.title = to.meta.title
        ? 'HealthQuilt | ' + to.meta.title
        : 'HealthQuilt | QHR'
    },
  },
  components: {
    'dashboard-layout': DashboardLayout,
    'simple-layout': SimpleLayout,
    'portal-layout': PortalLayout,
  },
}
</script>

<style>
.v-data-table td,
.v-data-table th {
  padding: 13px 16px 10px;
}
.v-data-table__progress th {
  padding: 0;
}
</style>
