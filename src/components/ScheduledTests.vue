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
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-spacer></v-spacer>
          <v-dialog v-model="deleteDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">Delete Test</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedItem.comment"
                        label="Comment"
                        :rules="requiredFieldRules"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="setTestStatus(editedItem, 'deleted')"
                  >Submit</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <span style="white-space: nowrap;">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                color="orange"
                class="mr-2"
                @click="openTestDialog(item)"
              >
                mdi-pencil
              </v-icon>
            </template>
            <span>Edit test results</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                color="black"
                class="mr-2"
                @click="deleteItem(item)"
              >
                mdi-trash-can
              </v-icon>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </span>
      </template>

      <template v-slot:item.created_datetime="{ item }">
        {{
          item.created_datetime ? formatTime(item.created_datetime.$date) : ''
        }}
      </template>

      <template v-slot:item.status="{ item }">
        <span class="status">{{ item.status }}</span>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-icon
              v-on="on"
              class="mr-2"
              color="blue"
              @click="setTestStatus(item, 'unverified')"
            >
              check_circle_outline
            </v-icon>
          </template>
          <span>Click to Confirm</span>
        </v-tooltip>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-row>
            <v-col>
              <v-card class="pa-2" outlined tile>
                <v-list-item>
                  <v-list-item-content>
                    <br />
                    <v-list-item-title class="text-left">
                      Patient Info
                    </v-list-item-title>
                    <hr />
                    <v-list-item-subtitle class="text-left">
                      <span>Email:</span>
                      <span class="black-font">
                        {{ item.patient.email }}
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      <span>Phone:</span>
                      <span class="black-font">
                        {{ formatPhone(item.patient.phone) }}
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      <span>DoB:</span>
                      <span class="black-font">
                        {{ formatDate(item.patient.dob) }}
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      <span>Status:</span>
                      <span class="black-font">
                        {{ item.patient.status }}
                      </span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>

            <v-col>
              <v-card class="pa-2" outlined tile>
                <v-list-item>
                  <v-list-item-avatar
                    tile
                    size="80"
                    color="grey"
                    v-if="!!item.imageUrl && item.type === 'antibody'"
                  >
                    <v-dialog v-model="dialog" width="500">
                      <template v-slot:activator="{ on }">
                        <v-img
                          v-on="on"
                          max-width="500"
                          max-height="500"
                          :src="item.imageUrl"
                        />
                      </template>
                      <v-card>
                        <v-img
                          max-width="500"
                          max-height="500"
                          :src="item.imageUrl"
                        />
                        <v-divider></v-divider>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="primary" text @click="dialog = false">
                            Close
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <br />
                    <v-list-item-title class="text-left">
                      Test
                    </v-list-item-title>
                    <hr />
                    <v-list-item-subtitle class="text-left">
                      <span>Method:</span>
                      <span class="black-font">
                        {{ item.method }}
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      <span>Manufacturer:</span>
                      <span class="black-font">
                        {{ item.manufacturer }}
                      </span>
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
                    <v-list-item-title class="text-left">
                      Clinic
                    </v-list-item-title>
                    <hr />
                    <v-list-item-subtitle class="text-left">
                      <span>Name:</span>
                      <span class="black-font">
                        {{ item.patient.clinic.name }}
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      <span>Email:</span>
                      <span class="black-font">
                        {{ item.patient.clinic.email }}
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      <span>Phone:</span>
                      <span class="black-font">
                        {{ formatPhone(item.patient.clinic.phone) }}
                      </span>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text-left">
                      <span>Timezone:</span>
                      <span class="black-font">
                        {{ item.patient.clinic.timezone }}</span
                      >
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
          </v-row>
        </td>
      </template>
    </v-data-table>
    <TestResultsDialog
      :patientId="currentTest && currentTest.patient_id.$oid"
      :test="currentTest"
      v-model="testResultsDialog"
      @updated="updateTest"
    ></TestResultsDialog>
    <TestSOAPFormDialog
      :test="currentTest"
      v-model="testSOAPFormDialog"
      @close="closeSoapDialog"
    ></TestSOAPFormDialog>
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
import TestSOAPFormDialog from '@/components/TestSOAPForm'
import TestResultsDialog from '@/components/TestResultsDialog'

export default {
  components: {
    TestSOAPFormDialog,
    TestResultsDialog,
  },
  data: () => ({
    loading: true,
    deleteDialog: false,
    testSOAPFormDialog: false,
    testResultsDialog: false,
    show: false,
    expanded: [],
    search: '',
    currentTest: null,
    currentTestData: null,
    tests: [],
    dialog: false,
    editedIndex: -1,
    editedItem: {
      patient_id: '',
      index: '',
      status: '',
      comment: '',
    },
    defaultItem: {
      patient_id: '',
      index: '',
      status: '',
      comment: '',
    },
    requiredFieldRules: [(v) => !!v || 'This is a required field'],
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
        { text: 'Actions', value: 'actions', sortable: false, width: 100 },
        { text: 'First Name', value: 'patient.firstname', width: 120 },
        { text: 'Last Name', value: 'patient.lastname', width: 120 },
        { text: 'Clinic', value: 'patient.clinic.name', width: 200 },
        { text: 'Test Entered', value: 'created_datetime', width: 200 },
        { text: 'Type', value: 'type', width: 130 },
        { text: 'Results', value: 'results', width: 200 },
        {
          text: 'Status',
          value: 'status',
          width: 130,
        },
      ]
    },
  },

  mounted() {
    this.fetchItems()
  },

  watch: {
    testSOAPFormDialog(value) {
      if (!value) {
        this.fetchItems()
      }
    },
    deleteDialog(value) {
      value || this.close()
    },
  },

  methods: {
    fetchItems() {
      API.get('tests?status=pending&encounter=true&response=true', {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(({ data }) => {
          this.tests = data.map((test) => ({
            ...test,
            imageUrl: this.getImageUrl(test.image),
            results: this.getTestResultsText(test),
          }))
          this.loading = false
        })
        .catch((error) => {
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

    setTestStatus(test, status) {
      const app = this
      const formData = {
        _id: test._id.$oid,
        status: status,
        comment: test.comment,
      }

      if (!test.encounter && 'verified' == status) {
        app.snackbarText = 'No SOAP Note recorded for test result.'
        app.snackbarColor = 'red'
        app.snackbar = true
      } else {
        API.post('tests/status', formData, {
          headers: AuthHelper.getAuthHeaders(),
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Status updated successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.fetchItems()
            } else {
              app.snackbarText = 'Could not be updated'
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
    close() {
      this.deleteDialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    deleteItem(item) {
      this.editedItem = {
        _id: item._id,
        comment: item.comment,
      }
      this.deleteDialog = true
    },
    formatTime(dateStr) {
      if (dateStr)
        return (
          new Date(dateStr).toLocaleDateString() +
          ' ' +
          new Date(dateStr).toLocaleTimeString()
        )
    },
    formatDate(dob) {
      return dob ? new Date(dob.$date).toLocaleDateString() : ''
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
    getTestResultsText(item) {
      let results = ''
      if (item.type == 'antibody') {
        if (item.igm === 'Positive') {
          results += 'IgM (+)'
        } else if (item.igm === 'Negative') {
          results += 'IgM (-)'
        }
        if (item.igg === 'Positive') {
          results += ' Igg(+)'
        } else if (item.igg === 'Negative') {
          results += ' Igg(-)'
        }
      } else if (item.type == 'covid19') {
        results = item.covid
      }
      return results || 'Pending'
    },
    getImageUrl(image) {
      const user = AuthHelper.loggedIn()
      return (
        API.defaults.baseURL +
        'images/' +
        image +
        '?username=' +
        user['username'] +
        '&auth_token=' +
        user['token']
      )
    },
    openTestSOAPDialog(test) {
      this.currentTest = test
      this.testSOAPFormDialog = true
    },
    closeSoapDialog({ success, encounter }) {
      this.testSOAPFormDialog = false
      if (success) {
        this.currentTest.encounter = encounter
      }
    },
    openTestDialog(test) {
      this.currentTest = test
      this.testResultsDialog = true
    },
    updateTest() {
      this.testResultsDialog = false
      this.tests = []
      this.loading = true
      this.fetchItems()
    },
  },
}
</script>
