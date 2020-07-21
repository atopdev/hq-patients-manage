<template>
  <v-card>
    <v-container class="bot-border">
      <v-img :src="require('../assets/logo.png')" contain height="120" />
    </v-container>
    <v-card-title>
      <v-icon color="orange" class="mr-2">mdi-form-select</v-icon>
      {{ title }}
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :expanded.sync="expanded"
      single-expand
      show-expand
      :headers="headers"
      :items="tests"
      item-key="_id.$oid"
      class="elevation-1"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      calculate-widths
      :custom-sort="customSort"
      :items-per-page="20"
      :footer-props="{ 'items-per-page-options': [20, 30, 50, 100, -1] }"
    >
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-row>
            <v-col>
              <v-card class="pa-2" outlined tile>
                <v-list-item>
                  <v-list-item-content>
                    <br />
                    <v-list-item-title class="text-left"
                      >Patient Info</v-list-item-title
                    >
                    <hr />
                    <v-list-item-subtitle class="text-left">
                      Email:
                      <span class="black-font">{{ item.patient.email }}</span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      Phone:
                      <span class="black-font">{{
                        formatPhone(item.patient.phone)
                      }}</span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      DoB:
                      <span class="black-font">{{
                        formatDate(item.patient.dob.$date)
                      }}</span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      Status:
                      <span class="black-font">{{ item.patient.status }}</span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>

            <v-col>
              <v-card class="pa-2" outlined tile>
                <v-list-item>
                  <v-list-item-avatar
                    v-if="!!item.image && item.type === 'antibody'"
                    tile
                    size="80"
                    color="grey"
                  >
                    <v-dialog v-model="dialog" width="500">
                      <template v-slot:activator="{ on }">
                        <v-img
                          v-on="on"
                          max-width="500"
                          max-height="500"
                          :src="item.image"
                        />
                      </template>
                      <v-card>
                        <v-img
                          max-width="500"
                          max-height="500"
                          :src="item.image"
                        />
                        <v-divider></v-divider>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text @click="dialog = false"
                            >close</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <br />
                    <v-list-item-title class="text-left"
                      >Test</v-list-item-title
                    >
                    <hr />
                    <v-list-item-subtitle class="text-left">
                      Method: <span class="black-font">{{ item.method }}</span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      Manufacturer:
                      <span class="black-font">{{ item.manufacturer }}</span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-if="
                        item.tests &&
                        item.tests.type === 'covid19' &&
                        !!item.tests.pdf
                      "
                      class="text-left"
                    >
                      Report:
                      <a :href="getPDFUrl(item.tests.pdf)" target="_blank">
                        click to see
                      </a>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
            <v-col>
              <v-card class="pa-2" outlined tile>
                <v-list-item>
                  <v-list-item-content>
                    <br />
                    <v-list-item-title class="text-left"
                      >Clinic</v-list-item-title
                    >
                    <hr />
                    <v-list-item-subtitle class="text-left"
                      >Name:
                      <span class="black-font">{{
                        item.patient.clinic.name
                      }}</span></v-list-item-subtitle
                    >
                    <v-list-item-subtitle class="text-left"
                      >Email:
                      <span class="black-font">{{
                        item.patient.clinic.email
                      }}</span></v-list-item-subtitle
                    >
                    <v-list-item-subtitle class="text-left"
                      >Phone:
                      <span class="black-font">{{
                        formatPhone(item.patient.clinic.phone)
                      }}</span></v-list-item-subtitle
                    >
                    <v-list-item-subtitle class="text-left"
                      >Timezone:
                      <span class="black-font">{{
                        item.patient.clinic.timezone
                      }}</span></v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
          </v-row>
        </td>
      </template>
      <template v-slot:item.created_datetime="{ item }">
        {{
          item.created_datetime ? formatTime(item.created_datetime.$date) : ''
        }}
      </template>
      <template v-slot:item.status="{ item }">
        <span class="status">{{ item.status }}</span>
        <v-icon class="mr-2" color="green">check_circle_outline</v-icon>
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

<style lang="scss">
.bot-border {
  border-bottom: 5px solid;
  margin-top: 4px;
}
thead,
tr {
  vertical-align: top;
}
.black-font {
  color: black;
}
.status {
  text-transform: capitalize;
  margin-right: 6px;
}
</style>

<script>
import _ from 'lodash'
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
export default {
  data: () => ({
    loading: true,
    dialog: false,
    expanded: [],
    search: '',
    workStatuses: {
      cleared: 'Return to Work',
      quarantine_exposure: 'Quarantine: Exposure',
      quarantine_igm_positive: 'Quarantine: IgM positive',
      quarantine_covid19_positive: 'Quarantine: COVID-19 positive',
      stay_at_home: 'Stay at home due to risk / illness',
    },
    headers: [
      { text: 'First Name', value: 'patient.firstname', width: 120 },
      { text: 'Last Name', value: 'patient.lastname', width: 120 },
      { text: 'Clinic', value: 'patient.clinic.name', width: 200 },
      { text: 'Test Entered', value: 'created_datetime', width: 220 },
      { text: 'Type', value: 'type', width: 120 },
      { text: 'Result', value: 'results', width: 200 },
      { text: 'Status', value: 'status', width: 200 },
    ],
    tests: [],
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

  mounted() {
    this.fetchItems()
  },

  methods: {
    fetchItems() {
      API.get('tests?status=verified', {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(({ data }) => {
          this.tests = data.map((test) => ({
            ...test,
            image: this.getImageUrl(test.image),
            results: this.getTestResultsText(test),
          }))
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
          this.snackbarText = error
          this.snackbarColor = 'red'
          this.snackbar = true
        })
    },
    customSort: function (items, index, isDesc) {
      items.sort((a, b) => {
        let one = _.get(a, index[0])
        let two = _.get(b, index[0])
        if (!one || !two) {
          return 0
        }

        if (typeof one !== 'undefined') {
          if (index[0] == 'created_datetime') {
            one = one['$date']
            two = two['$date']

            return isDesc[0] ? two - one : one - two
          }
          if (!isDesc[0]) {
            return one.toLowerCase().localeCompare(two.toLowerCase())
          } else {
            return two.toLowerCase().localeCompare(one.toLowerCase())
          }
        }
      })
      return items
    },
    formatTime(dateStr) {
      if (dateStr)
        return (
          new Date(dateStr).toLocaleDateString() +
          ' ' +
          new Date(dateStr).toLocaleTimeString()
        )
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
    formatPhone(phoneStr) {
      return phoneStr
        ? '(' +
            phoneStr.substring(0, 3) +
            ')' +
            ' ' +
            phoneStr.substring(3, 6) +
            '-' +
            phoneStr.substring(6, 10)
        : ' '
    },
    getImageUrl(image) {
      if (!image) return ''

      const user = AuthHelper.loggedIn()
      return (
        API.defaults.baseURL +
        'images/' +
        image +
        '?&auth_token=' +
        user['token']
      )
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
    getTestResultsText(item) {
      let results = ''
      if (item.type == 'antibody') {
        results =
          (item.igm == 'Positive' || item.igm == 'positive' || item.igm == '+'
            ? 'IgM (+)'
            : 'IgM (-)') +
          ' ' +
          (item.igg == 'Positive' || item.igg == 'positive' || item.igg == '+'
            ? 'IgG (+)'
            : 'IgG (-)')
      } else if (item.type == 'covid19') {
        results = item.covid
      }
      return results
    },
  },
}
</script>
