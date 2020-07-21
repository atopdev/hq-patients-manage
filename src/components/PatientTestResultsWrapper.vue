<template>
  <v-content>
    <v-container class="bot-border">
      <v-img :src="require('../assets/logo.png')" contain height="120" />
    </v-container>
    <div v-if="!printMode">
      <v-btn @click="print" color="warning" class="ma-2" dark>Print</v-btn>
      <v-btn @click="goToPDF" color="warning" class="ma-2" dark
        >Download PDF</v-btn
      >
    </div>
    <patient-test-results />
  </v-content>
</template>

<script>
import PatientTestResults from '@/components/PatientTestResults'

export default {
  components: {
    PatientTestResults,
  },
  data() {
    return {
      printMode: null,
    }
  },
  methods: {
    print() {
      this.printMode = true
      var self = this
      setTimeout(() => {
        window.print()
        self.printMode = false
      }, 100)
    },
    goToPDF() {
      let routeData = this.$router.resolve({
        name: 'patient_test_results_pdf',
        query: this.$route.query,
      })
      window.open(routeData.href, '_blank')
    },
  },
}
</script>
