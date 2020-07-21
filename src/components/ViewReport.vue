<template>
  <v-card class="elevation-12 form pb-6">
    <v-container>
      <test-report :data="testingReport"></test-report>
    </v-container>

    <v-overlay :value="loading" absolute>
      <v-progress-circular
        :size="50"
        color="primary"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
  </v-card>
</template>
<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import TestReport from '@/components/common/TestReport'

export default {
  name: 'ViewReport',
  components: {
    TestReport,
  },
  props: {
    params: {
      type: Object,
    },
    print_mode: {
      type: Boolean,
    },
  },
  data() {
    return {
      testingReport: null,
      loading: false,
    }
  },
  methods: {
    getTestingSummary(params) {
      this.loading = true
      API.get(`report/${params.id}`, {
        headers: AuthHelper.getAuthHeaders(),
        params: { date: params.date },
      })
        .then(({ data }) => {
          this.testingReport = data
        })
        .catch((err) => {
          console.log(err)
          this.testingReport = null
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
  watch: {
    params(val) {
      if (val) {
        this.getTestingSummary(val)
      }
    },
  },
}
</script>

<style lang="scss">
.testing-report {
  .row {
    .col:first-child {
      text-align: left !important;
    }
    .col:last-child {
      text-align: right !important;
    }
  }
}
</style>
