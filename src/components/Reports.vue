<template>
  <v-card>
    <v-card-title>
      Reports
    </v-card-title>
    <v-card-text>
      <v-content>
        <v-row align="baseline" class="flex-md-row flex-sm-column">
          <v-col cols="2" md="2" sm="12">
            <v-subheader v-text="'Daily Status Report'"></v-subheader>
          </v-col>
          <v-col cols="3" md="3" sm="12">
            <v-select
              v-model="selectedEmployer"
              :items="employers"
              label="Select employer"
              solo
            ></v-select>
          </v-col>
          <v-col cols="2" lg="2">
            <date-picker v-model="date" solo />
          </v-col>
          <v-col class="text-left">
            <v-btn
              class="mr-4"
              color="primary"
              :disabled="!selectedEmployer || !date"
              @click="viewReport"
            >
              <v-icon left>remove_red_eye</v-icon> View
            </v-btn>
            <v-btn
              color="info"
              text
              :loading="downloading"
              :disabled="!selectedEmployer || !date"
              @click="downloadPDF"
            >
              <v-icon left>get_app</v-icon> Download PDF
            </v-btn>
          </v-col>
        </v-row>
        <view-report :params="reportParams"></view-report>
      </v-content>
    </v-card-text>
  </v-card>
</template>
<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import { saveAs } from 'file-saver'
import DatePicker from '@/components/DatePicker'
import ViewReport from '@/components/ViewReport'

export default {
  name: 'Reports',
  components: {
    DatePicker,
    ViewReport,
  },
  data() {
    return {
      employers: [],
      selectedEmployer: null,
      date: null,
      reportParams: null,
      downloading: false,
    }
  },
  mounted() {
    this.getEmployers()
  },
  methods: {
    getEmployers() {
      var self = this
      API.get('employers?is_all=true', {
        headers: AuthHelper.getAuthHeaders(),
      }).then(({ data: response }) => {
        response.data.forEach((employer) => {
          self.employers.push({
            text: employer.name,
            value: employer['_id']['$oid'],
          })
        })
      })
    },
    viewReport() {
      this.reportParams = {
        id: this.selectedEmployer,
        date: this.date,
      }
    },
    downloadPDF() {
      this.downloading = true
      const employer = this.employers.find(
        (emp) => emp.value === this.selectedEmployer
      )
      const employerName = employer.text.replace(' ', '_').toLowerCase()
      const filename = `report_${employerName}_${this.date}.pdf`

      API.get(`report/${this.selectedEmployer}/pdf`, {
        headers: AuthHelper.getAuthHeaders(),
        params: { date: this.date },
        responseType: 'blob',
      })
        .then(({ data }) => {
          saveAs(
            new Blob([data], { type: 'text/plain;charset=utf-8' }),
            filename
          )
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          this.downloading = false
        })
    },
  },
}
</script>
