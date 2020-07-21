<template>
  <v-card>
    <div>
      <table-view-component
        :title="title"
        :headers="headers"
        :items="patients"
        :loading="loading"
        :options.sync="options"
        :totalCount="totalCount"
        @search="filterRecords"
        item-key="patient_id"
      >
        <template v-slot:item.last_response="{ item }">
          {{ item.last_response ? formatTime(item.last_response) : '' }}
        </template>
        <template v-slot:item.last_sent="{ item }">
          {{ item.last_sent ? formatTime(item.last_sent) : '' }}
        </template>
        <template v-slot:top> </template>
        <template v-slot:item.actions="{ item }">
          <v-icon class="mr-2" @click="sendSms(item)">
            textsms
          </v-icon>
          <v-icon class="mr-2" @click="copyFormLink(item)">
            file_copy
          </v-icon>
        </template>
      </table-view-component>
      <v-snackbar
        v-model="snackbar"
        bottom
        :color="snackbarColor"
        :timeout="snackbarTimeout"
      >
        {{ snackbarText }}
        <v-btn dark text @click="snackbar = false">
          Dismiss
        </v-btn>
      </v-snackbar>
    </div>
  </v-card>
</template>
<style lang="scss">
.bot-border {
  border-bottom: 5px solid;
  margin-top: 4px;
}
</style>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import TableViewComponent from '@/components/TableViewComponent'
export default {
  components: {
    TableViewComponent,
  },
  data: () => ({
    search: '',
    headers: [
      { text: 'First Name', value: 'firstname', width: 150 },
      { text: 'Last Name', value: 'lastname', width: 150 },
      { text: 'Phone', value: 'phone', with: 130 },
      { text: 'Email', value: 'email', width: 150 },
      { text: 'Employer', value: 'employer_name', width: 150 },
      { text: 'Timezone', value: 'timezone', width: 140 },
      { text: 'Last sent', value: 'last_sent', width: 200 },
      { text: 'Last response', value: 'last_response', width: 200 },
      { text: 'Actions', value: 'actions', sortable: false, width: 120 },
    ],
    patients: [],
    options: {
      sortBy: ['lastname'],
      sortDesc: [false],
    },
    totalCount: 0,
    employers: [],
    loading: false,
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),

  computed: {
    title() {
      return this.$route.meta.title
    },
  },

  watch: {
    options: {
      handler() {
        this.getData()
      },
      deep: true,
    },
  },

  mounted() {
    this.fetchItems()
  },

  methods: {
    getData(forSearch = false) {
      this.loading = true
      API.get('/patients?callcenter=true', {
        headers: AuthHelper.getAuthHeaders(),
        params: {
          search: this.search,
          sort_by: this.options.sortBy[0] || '',
          sort_dir: this.options.sortDesc[0] ? 'desc' : 'asc',
          page: forSearch ? 1 : this.options.page || 1,
          per_page: this.options.itemsPerPage || 10,
        },
      })
        .then(({ data: response }) => {
          this.loading = false
          this.patients = response.data.data
          this.totalCount = response.data.pagination.total
        })
        .catch((error) => {
          this.snackbarText = error
          this.snackbarColor = 'red'
          this.snackbar = true
        })
    },
    fetchItems() {
      const app = this
      API.get('employers?is_all=true', {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(({ data: response }) => {
          app.employers = response.data
        })
        .catch(function (error) {
          app.snackbarText = error
          app.snackbarColor = 'red'
          app.snackbar = true
        })
    },
    formatTime(dateStr) {
      if (dateStr)
        return (
          new Date(dateStr).toLocaleDateString() +
          ' ' +
          new Date(dateStr).toLocaleTimeString()
        )
    },
    sendSms(item) {
      const app = this
      const index = this.patients.indexOf(item)
      const r = confirm('Are you sure you want to send SMS to this patient?')
      if (r == true) {
        const id = this.patients[index].patient_id
        API.post(
          'sms',
          { patient_id: id },
          {
            headers: AuthHelper.getAuthHeaders(),
          }
        )
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'SMS was successfully sent!'
              app.snackbarColor = 'success'
              app.snackbar = true
            } else {
              app.snackbarText = 'Could not be sent'
              app.snackbarColor = 'red'
              app.snackbar = true
            }
          })
          .catch(function (error) {
            app.snackbarText = error
            app.snackbarColor = 'red'
            app.snackbar = true
          })
      }
    },
    copyFormLink(item) {
      let temporaryInputElement = document.createElement('input')
      temporaryInputElement.type = 'text'
      const link =
        window.location.origin +
        '/#/covid19?phone=' +
        item.phone +
        '&p=' +
        item.patient_id
      temporaryInputElement.value = link

      document.body.appendChild(temporaryInputElement)

      temporaryInputElement.select()
      document.execCommand('Copy')

      document.body.removeChild(temporaryInputElement)
    },
    filterRecords(search) {
      this.search = search
      this.getData(true)
    },
  },
}
</script>
