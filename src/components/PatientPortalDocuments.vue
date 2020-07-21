<template>
  <v-card>
    <v-card-title>
      <v-icon color="orange" class="mr-2">mdi-file</v-icon>
      {{ title }}
      <v-spacer></v-spacer>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="tests"
      class="elevation-1"
      :loading="loading"
      loading-text="Loading... Please wait"
      calculate-widths
      :items-per-page="20"
      :footer-props="{ 'items-per-page-options': [20, 30, 50, 100, -1] }"
    >
      <template v-slot:item.filename="{ item }">
        <a
          :href="getPDFUrl(item.file_id)"
          style="text-decoration: none;"
          target="_blank"
          >{{ item.filename }}</a
        >
      </template>

      <template v-slot:item.actions="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <a :href="getPDFUrl(item.file_id)" target="_blank" download>
              <v-icon v-on="on" color="orange" class="mr-2">
                mdi-cloud-download
              </v-icon>
            </a>
          </template>
          <span>Download</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <v-snackbar
      v-model="snackbar"
      bottom
      :color="snackbarColor"
      :timeout="snackbarTimeout"
    >
      {{ snackbarText }}
      <v-btn dark text @click="snackbar = false">Dismiss</v-btn>
    </v-snackbar>
  </v-card>
</template>
<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'

export default {
  created: function () {
    this.isSuperadmin = AuthHelper.loggedIn().roles.indexOf('superadmin') >= 0
  },
  data: () => ({
    isSuperadmin: false,
    tests: [],
    printMode: false,
    loading: true,
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),
  computed: {
    title() {
      return this.$route.meta.title
    },
    headers() {
      return [
        { text: 'File Name', value: 'filename', widths: '200' },
        { text: 'Actions', value: 'actions', widths: '200' },
      ]
    },
  },
  mounted() {
    this.fetchPatientTests()
  },
  methods: {
    fetchPatientTests() {
      const app = this
      let url = '/user/patientportal/docs'
      if (this.isSuperadmin) {
        url += `?id=${localStorage.getItem('impersonated_patient_id')}`
      }
      API.get(url, {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(({ data }) => {
          this.tests = data
          this.loading = false
        })
        .catch(function (error) {
          app.snackbarText = error
          app.snackbarColor = 'red'
          app.snackbar = true
          this.loading = false
        })
    },
    getPDFUrl(fileId) {
      const user = AuthHelper.loggedIn()
      return (
        API.defaults.baseURL +
        'pdf-files/' +
        fileId +
        '?username=' +
        user['username'] +
        '&auth_token=' +
        user['token']
      )
    },
  },
}
</script>
