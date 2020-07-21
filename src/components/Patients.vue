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
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-spacer></v-spacer>
            <v-dialog v-model="addEditDialog" max-width="500px">
              <template v-slot:activator="{ on }">
                <v-btn color="secondary" dark class="mb-2" v-on="on"
                  >New Patient</v-btn
                >
              </template>

              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="editedItem.firstname"
                          label="First Name"
                          :rules="requiredFieldRules"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="editedItem.lastname"
                          label="Last Name"
                          :rules="requiredFieldRules"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="editedItem.email"
                          label="Email"
                          :rules="requiredEmailFieldRules"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <date-picker
                          v-model="editedItem.dob"
                          label="Date of Birth"
                          :rules="requiredFieldRules"
                          append-icon
                        />
                      </v-col>
                      <v-col cols="12" md="8">
                        <v-select
                          v-model="editedItem.employer_id"
                          :items="employers"
                          label="Employer"
                          item-text="name"
                          item-value="_id.$oid"
                          :rules="requiredFieldRules"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-select
                          v-model="editedItem.primaryLanguage"
                          :items="languageOptions"
                          label="Language"
                          item-value="value"
                          item-text="text"
                          :rules="requiredFieldRules"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="editedItem.phone"
                          label="Phone"
                          :rules="phoneRules"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="editedItem.timezone"
                          :items="['ET', 'CT', 'MT', 'PT', 'AKT']"
                          label="Timezone"
                          :rules="requiredFieldRules"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="editedItem.clinic_id"
                          :items="clinics"
                          label="Clinic"
                          item-text="name"
                          item-value="_id.$oid"
                          :rules="requiredFieldRules"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Cancel</v-btn
                  >
                  <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="uploadDialog" max-width="500px">
              <template v-slot:activator="{ on }">
                <v-btn color="secondary" dark class="mb-2 ml-2" v-on="on"
                  >Upload CSV</v-btn
                >
              </template>

              <v-card>
                <v-card-title>
                  <span class="headline">Upload CSV</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <template>
                          <v-file-input
                            show-size
                            chips
                            accept="text/csv"
                            label="CSV File"
                            v-model="file"
                          ></v-file-input>
                        </template>
                      </v-col>
                      <v-col cols="12">
                        <v-select
                          v-model="employer_id"
                          :items="employers"
                          label="Employer"
                          item-text="name"
                          item-value="_id.$oid"
                          :rules="requiredFieldRules"
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-select
                          v-model="primaryLanguage"
                          :items="languageOptions"
                          label="Language"
                          item-value="value"
                          item-text="text"
                          :rules="requiredFieldRules"
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-select
                          v-model="clinic_id"
                          :items="clinics"
                          label="Clinic"
                          item-text="name"
                          item-value="_id.$oid"
                          :rules="requiredFieldRules"
                        ></v-select>
                      </v-col>
                      <v-col cols="12">
                        <v-checkbox
                          v-model="testDetails"
                          label="Test Details"
                          required
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="12" v-if="testDetails">
                        <date-picker
                          v-model="testScheduleDate"
                          label="Scheduled date of test"
                          append-icon
                        />
                      </v-col>
                      <v-col cols="12" v-if="testDetails">
                        <v-select
                          v-model="testTypes"
                          :items="testTypeItems"
                          label="Test Type"
                          multiple
                          persistent-hint
                        ></v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        v-if="testDetails && testTypes.indexOf('antibody') >= 0"
                      >
                        <v-select
                          v-model="testAntiManu"
                          :items="manufacturerAntibody"
                          item-text="text"
                          item-value="value"
                          :rules="requiredFieldRules"
                          label="Antibody Manufacturer"
                          required
                        ></v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        v-if="testDetails && testTypes.indexOf('antibody') >= 0"
                      >
                        <v-select
                          v-model="testAntiMethod"
                          :items="methodAntibody"
                          item-text="text"
                          item-value="value"
                          :rules="requiredFieldRules"
                          label="Antibody Method"
                          required
                        ></v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        v-if="testDetails && testTypes.indexOf('covid19') >= 0"
                      >
                        <v-select
                          v-model="testCovidManu"
                          :items="manufacturerCovid"
                          item-text="text"
                          item-value="value"
                          :rules="requiredFieldRules"
                          label="Covid 19 Test Manufacturer"
                          required
                        ></v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        v-if="testDetails && testTypes.indexOf('covid19') >= 0"
                      >
                        <v-select
                          v-model="testCovidMethod"
                          :items="methodCovid"
                          item-text="text"
                          item-value="value"
                          :rules="requiredFieldRules"
                          label="Covid 19 Test Method"
                          required
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="uploadDialog = false"
                    >Cancel</v-btn
                  >
                  <v-btn color="primary" @click="upload">Upload</v-btn>
                </v-card-actions>
                <v-overlay :value="uploading" absolute>
                  <v-progress-circular
                    :size="50"
                    color="primary"
                    indeterminate
                  ></v-progress-circular>
                </v-overlay>
              </v-card>
            </v-dialog>
            <v-dialog v-model="invalidCSVPatientsDialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">CSV Upload Result</span>
                </v-card-title>

                <v-card-text>
                  <v-container class="scroll-contaniner">
                    <v-expansion-panels accordion>
                      <v-expansion-panel
                        key="normal"
                        v-if="insertedPatients.length > 0"
                      >
                        <v-expansion-panel-header
                          >Successfully added these
                          patients</v-expansion-panel-header
                        >
                        <v-expansion-panel-content>
                          <v-row
                            v-for="(item, index) in insertedPatients"
                            :key="'success-info-block-' + index"
                          >
                            <v-col cols="12">
                              {{ item.firstname }} {{ item.lastname }}
                              {{ item.phone }} {{ item.email }} {{ item.dob }}
                              {{ item.timezone }}
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel
                        key="invalid"
                        v-if="
                          invalidPatients.length > 0 ||
                          missingPatients.length > 0
                        "
                      >
                        <v-expansion-panel-header
                          >Failed to add: Invalid or missing
                          data</v-expansion-panel-header
                        >
                        <v-expansion-panel-content>
                          <v-row
                            v-for="(item, index) in invalidPatients"
                            :key="'invalid-info-block-' + index"
                          >
                            <v-col cols="12">
                              {{ item.firstname }} {{ item.lastname }}
                              {{ item.phone }} {{ item.email }} {{ item.dob }}
                              {{ item.timezone }}
                            </v-col>
                          </v-row>
                          <v-row
                            v-for="(item, index) in missingPatients"
                            :key="'missing-info-block-' + index"
                          >
                            <v-col cols="12">
                              {{ item }}
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel
                        key="badtz"
                        v-if="badtzPatients.length > 0"
                      >
                        <v-expansion-panel-header
                          >Failed to add: Bad timezone</v-expansion-panel-header
                        >
                        <v-expansion-panel-content>
                          <v-row
                            v-for="(item, index) in badtzPatients"
                            :key="'badtz-info-block-' + index"
                          >
                            <v-col cols="12">
                              {{ item.firstname }} {{ item.lastname }}
                              {{ item.phone }} {{ item.email }} {{ item.dob }}
                              {{ item.timezone }}
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                      <v-expansion-panel
                        key="duplicated"
                        v-if="duplicatePatients.length > 0"
                      >
                        <v-expansion-panel-header
                          >Failed to add: duplicate
                          patients</v-expansion-panel-header
                        >
                        <v-expansion-panel-content>
                          <v-row
                            v-for="(item, index) in duplicatePatients"
                            :key="'duplicate-info-block-' + index"
                          >
                            <v-col cols="12">
                              {{ item.firstname }} {{ item.lastname }}
                              {{ item.phone }} {{ item.email }} {{ item.dob }}
                              {{ item.timezone }}
                            </v-col>
                          </v-row>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="invalidCSVPatientsDialog = false"
                    >Close</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                color="orange"
                class="mr-2"
                @click="openTestDialog(item.patient_id)"
              >
                note_add
              </v-icon>
            </template>
            <span>Add test results</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                color="blue"
                class="mr-2"
                @click="copyFormLink(item)"
              >
                file_copy
              </v-icon>
            </template>
            <span>Copy form link</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                color="blue"
                class="mr-2"
                @click="sendSms(item)"
              >
                textsms
              </v-icon>
            </template>
            <span>Send form SMS</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                color="orange"
                class="mr-2"
                @click="editItem(item)"
              >
                mdi-pencil
              </v-icon>
            </template>
            <span>Edit</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                class="mr-2"
                :color="getStatusColor(item.status)"
                @click="setItemStatus(item)"
              >
                check_circle_outline
              </v-icon>
            </template>
            <span>{{
              item.status == 'active' ? 'Deactivate' : 'Activate'
            }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                color="red"
                class="mr-2"
                @click="scheduleTelemedicine(item)"
              >
                mdi-calendar-plus
              </v-icon>
            </template>
            <span>Schedule Telemedicine</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                v-on="on"
                :color="item.user_activated ? 'red' : 'blue'"
                class="mr-2"
                @click="resendActivationEmail(item)"
              >
                mdi-send
              </v-icon>
            </template>
            <span>Resend activation email</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" @click="deleteItem(item)">
                mdi-delete
              </v-icon>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>
      </table-view-component>
      <TestResultsDialog
        :patientId="currentPatientId"
        v-model="testResultsDialog"
      ></TestResultsDialog>
      <ScheduleTelemedicineDialog
        :patientId="currentPatientId"
        :patientName="currentPatientName"
        v-model="scheduleTelemedicineDialog"
      ></ScheduleTelemedicineDialog>
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
<style>
.scroll-contaniner {
  max-height: 300px;
  overflow: auto;
}
.bot-border {
  border-bottom: 5px solid;
  margin-top: 4px;
}
</style>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import TestResultsDialog from '@/components/TestResultsDialog'
import ScheduleTelemedicineDialog from '@/components/ScheduleTelemedicineDialog'
import TableViewComponent from '@/components/TableViewComponent'
import DatePicker from '@/components/DatePicker'
export default {
  components: {
    TestResultsDialog,
    ScheduleTelemedicineDialog,
    TableViewComponent,
    DatePicker,
  },
  data: () => ({
    addEditDialog: false,
    uploadDialog: false,
    invalidCSVPatientsDialog: false,
    insertedPatients: [],
    invalidPatients: [],
    missingPatients: [],
    badtzPatients: [],
    duplicatePatients: [],
    testResultsDialog: false,
    scheduleTelemedicineDialog: false,
    currentPatientId: '',
    currentPatient: null,
    currentPatientName: '',
    file: null,
    testDetails: false,
    testTypes: [],
    testAntiMethod: 'Fingerstick',
    testAntiManu: 'HealGen',
    testCovidMethod: 'Nasopharyngeal',
    testCovidManu: 'Fulgent',
    testScheduleDate: new Date().toISOString().substr(0, 10),
    testTypeItems: [
      {
        text: 'Antibody Test',
        value: 'antibody',
      },
      {
        text: 'Covid 19 Test',
        value: 'covid19',
      },
    ],
    methodAntibody: [
      {
        text: 'Fingerstick',
        value: 'Fingerstick',
      },
      {
        text: 'Venous',
        value: 'Venous',
      },
    ],
    methodCovid: [
      {
        text: 'Nasopharyngeal',
        value: 'Nasopharyngeal',
      },
      {
        text: 'Orophyarngeal',
        value: 'Orophyarngeal',
      },
      {
        text: 'Sputum',
        value: 'Sputum',
      },
    ],
    manufacturerCovid: [
      {
        text: 'Fulgent',
        value: 'Fulgent',
      },
      {
        text: 'MicroGen',
        value: 'MicroGen',
      },
    ],
    manufacturerAntibody: [
      {
        text: 'Covisure',
        value: 'Covisure',
      },
      {
        text: 'HealGen',
        value: 'HealGen',
      },
      {
        text: 'SAScientific',
        value: 'SAScientific',
      },
    ],
    employer_id: '',
    primaryLanguage: '',
    clinic_id: '',
    search: '',
    headers: [
      { text: 'Actions', value: 'actions', sortable: false, width: 280 },
      { text: 'Status', value: 'status', width: 50 },
      { text: 'First Name', value: 'firstname', width: 150 },
      { text: 'Last Name', value: 'lastname', width: 150 },
      { text: 'Phone', value: 'phone', with: 130 },
      { text: 'Email', value: 'email', width: 150 },
      { text: 'Employer', value: 'employer_name', width: 150 },
      { text: 'Clinic', value: 'clinic_name', width: 150 },
      { text: 'Timezone', value: 'timezone', width: 100 },
      { text: 'Last sent', value: 'last_sent', width: 200 },
      { text: 'Last response', value: 'last_response', width: 200 },
    ],
    languageOptions: [
      { text: 'English', value: 'en' },
      { text: 'Español', value: 'es' },
    ],
    options: {
      sortBy: ['lastname'],
      sortDesc: [false],
    },
    totalCount: 0,
    loading: false,
    uploading: false,
    patients: [],
    employers: [],
    clinics: [],
    editedIndex: -1,
    editedItem: {
      id: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      dob: '',
      employer_id: '',
      clinic_id: '',
      last_sent: '',
      last_response: '',
      timezone: null,
      status: '',
      primaryLanguage: null,
    },
    defaultItem: {
      id: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      dob: '',
      employer_id: '',
      clinic_id: '',
      last_sent: '',
      last_response: '',
      timezone: null,
      status: '',
      primaryLanguage: null,
    },
    requiredFieldRules: [(v) => !!v || 'This is a required field'],
    requiredEmailFieldRules: [
      (v) => !!v || 'This is a required field',
      (v) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(v) || 'E-mail must be valid'
      },
    ],
    phoneRules: [
      (v) =>
        (!isNaN(parseInt(v)) && v.length == 10) ||
        'Phone number must be 10 digits no spaces or other charaters',
    ],
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),
  computed: {
    title() {
      return this.$route.meta.title
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New Patient' : 'Edit Patient'
    },
  },
  watch: {
    addEditDialog(val) {
      val || this.close()
    },
    options: {
      handler() {
        this.getData()
      },
      deep: true,
    },
    uploadDialog(val) {
      if (!val) {
        this.file = null
        this.employer_id = ''
        this.primaryLanguage = ''
        this.clinic_id = ''
        this.testDetails = false
        this.testTypes = []
        this.testAntiMethod = 'Fingerstick'
        this.testAntiManu = 'HealGen'
        this.testCovidMethod = 'Nasopharyngeal'
        this.testCovidManu = 'Fulgent'
        this.testScheduleDate = new Date().toISOString().substr(0, 10)
      }
    },
  },
  mounted() {
    this.fetchItems()
  },
  methods: {
    getData(forSearch = false) {
      this.loading = true
      API.get('/patients', {
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
      API.get('clinics?is_all=true', {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(({ data: response }) => {
          app.clinics = response.data
        })
        .catch(function (error) {
          app.snackbarText = error
          app.snackbarColor = 'red'
          app.snackbar = true
        })
    },
    getStatusColor(status) {
      return status == 'active' ? 'green' : 'red'
    },
    formatTime(dateStr) {
      if (dateStr)
        return (
          new Date(dateStr).toLocaleDateString() +
          ' ' +
          new Date(dateStr).toLocaleTimeString()
        )
    },
    editItem(item) {
      this.editedIndex = this.patients.indexOf(item)
      this.editedItem = Object.assign({}, item)
      if (this.editedItem.dob) {
        this.editedItem.dob = this.editedItem.dob.substr(0, 10)
      }
      this.addEditDialog = true
    },
    deleteItem(item) {
      const app = this
      const index = this.patients.indexOf(item)
      const r = confirm('Are you sure you want to delete this patient?')
      if (r == true) {
        const id = this.patients[index].patient_id
        API.delete('patients', {
          headers: AuthHelper.getAuthHeaders(),
          data: { id: id },
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Patient was deleted successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.getData()
            } else {
              app.snackbarText = 'Could not be deleted'
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
    setItemStatus(item) {
      this.editedIndex = this.patients.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.editedItem.status = item.status == 'active' ? 'inactive' : 'active'
      this.save()
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
      const link = window.location.origin + '/#/covid19?p=' + item.patient_id
      temporaryInputElement.value = link
      document.body.appendChild(temporaryInputElement)
      temporaryInputElement.select()
      document.execCommand('Copy')
      document.body.removeChild(temporaryInputElement)
      this.snackbarText = 'Link copied to clipboard'
      this.snackbarColor = 'primary'
      this.snackbar = true
    },
    close() {
      this.addEditDialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    save() {
      const app = this
      if (this.editedIndex > -1) {
        API.put('patients', this.editedItem, {
          headers: AuthHelper.getAuthHeaders(),
        })
          .then(function (response) {
            if (response.status == 200) {
              app.snackbarText = 'Patient was updated successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.getData()
            } else {
              app.snackbarText = 'Could not be updated'
              app.snackbarColor = 'red'
              app.snackbar = true
            }
          })
          .catch(function () {
            app.snackbarText = 'Could not add duplicated patient'
            app.snackbarColor = 'red'
            app.snackbar = true
          })
      } else {
        this.editedItem.status = 'active'
        API.post('patients', this.editedItem, {
          headers: AuthHelper.getAuthHeaders(),
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Patient was added successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.addEditDialog = false
              app.getData()
            } else {
              app.snackbarText = 'Could not be added'
              app.snackbarColor = 'red'
              app.snackbar = true
            }
          })
          .catch(function () {
            app.snackbarText = 'Could not add duplicated patient'
            app.snackbarColor = 'red'
            app.snackbar = true
          })
      }
    },
    upload() {
      const app = this
      app.uploading = true
      let formData = new FormData()
      formData.append('file', this.file)
      formData.append('employer_id', this.employer_id)
      formData.append('primaryLanguage', this.primaryLanguage)
      formData.append('clinic_id', this.clinic_id)
      formData.append('create_test', this.testDetails)
      if (this.testDetails) {
        formData.append('test_types', this.testTypes)
        formData.append('test_scheduled_date', this.testScheduleDate)
        formData.append('antibody_method', this.testAntiMethod)
        formData.append('antibody_manufacturer', this.testAntiManu)
        formData.append('covid_method', this.testCovidMethod)
        formData.append('covid_manufacturer', this.testCovidManu)
      }
      let headers = AuthHelper.getAuthHeaders()
      headers['Content-Type'] = 'multipart/form-data'
      API.post('upload/patients', formData, {
        headers: headers,
      })
        .then(function (response) {
          app.uploading = false
          if (response.data.success) {
            app.addEditDialog = false
            app.snackbar = true
            if (
              response.data.invalids.length == 0 &&
              response.data.missings.length == 0 &&
              response.data.duplicates.length == 0 &&
              response.data.badtz.length == 0
            ) {
              app.snackbarText = 'CSV uploaded successfully'
              app.snackbarColor = 'success'
            } else {
              app.snackbarText =
                'Invalid formatted patients or duplicated patients are not imported'
              app.snackbarColor = 'red'
            }
            app.uploadDialog = false
            app.invalidCSVPatientsDialog = true
            app.insertedPatients = response.data.inserted
            app.invalidPatients = response.data.invalids
            app.missingPatients = response.data.missings
            app.badtzPatients = response.data.badtz
            app.duplicatePatients = response.data.duplicates
            app.getData()
          } else {
            app.snackbarText = 'Could not be uploaded'
            app.snackbarColor = 'red'
            app.snackbar = true
          }
        })
        .catch(function (error) {
          app.uploading = false
          app.snackbarText = error
          app.snackbarColor = 'red'
          app.snackbar = true
        })
    },
    openTestDialog(patientId) {
      this.currentPatientId = patientId
      this.testResultsDialog = true
    },
    scheduleTelemedicine(patient) {
      this.currentPatientId = patient.patient_id
      this.currentPatientName = patient.firstname + ' ' + patient.lastname
      this.scheduleTelemedicineDialog = true
    },
    resendActivationEmail(patient) {
      const app = this
      if (patient.user_activated) {
        app.snackbarText = 'Patient already registered'
        app.snackbarColor = 'red'
        app.snackbar = true
        return
      }
      API.post(`patients/${patient.patient_id}/resend-activation`, null, {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(function () {
          app.snackbarText = 'Activation email sent successfully'
          app.snackbarColor = 'green'
          app.snackbar = true
        })
        .catch(function (error) {
          app.snackbarText = error.response.data.message || error
          app.snackbarColor = 'red'
          app.snackbar = true
        })
    },
    filterRecords(search) {
      this.search = search
      this.getData(true)
    },
  },
}
</script>
