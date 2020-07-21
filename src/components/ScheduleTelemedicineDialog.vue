<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">Schedule Telemedicine</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form id="form" ref="scheduleform" @submit.prevent="validate">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="formData.clinic"
                  :items="cliniccalitems"
                  label="Clinic Calendar"
                  prepend-icon="local_hospital"
                  item-text="name"
                  item-value="email"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <date-picker
                  v-model="formData.scheduledate"
                  label="Choose a date"
                  :rules="requiredFieldRules"
                  prepend-icon
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-menu
                  ref="starttimepickermenu"
                  v-model="starttimepickermenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="200px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="formData.starttime"
                      label="Start Time"
                      prepend-icon="event"
                      readonly
                      v-on="on"
                    >
                    </v-text-field>
                  </template>
                  <v-time-picker
                    v-model="formData.starttime"
                    @input="starttimepickermenu = false"
                    :max="formData.endtime"
                    width="200"
                    :allowed-minutes="scheduleTimeStep"
                    :rules="requiredFieldRules"
                  >
                  </v-time-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="endtimepickermenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="200px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="formData.endtime"
                      label="End Time"
                      prepend-icon="event"
                      readonly
                      v-on="on"
                    >
                    </v-text-field>
                  </template>
                  <v-time-picker
                    v-model="formData.endtime"
                    @input="endtimepickermenu = false"
                    :min="formData.starttime"
                    width="200"
                    :allowed-minutes="scheduleTimeStep"
                    :rules="requiredFieldRules"
                  >
                  </v-time-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Close</v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="save"
          type="submit"
          form="form"
          >Add</v-btn
        >
      </v-card-actions>
    </v-card>
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
  </v-dialog>
</template>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import DatePicker from '@/components/DatePicker'
export default {
  components: {
    DatePicker,
  },
  created() {
    this.getClinics()
  },
  name: 'ScheduleTelemedicineDialog',
  data: () => ({
    valid: false,
    starttimepickermenu: false,
    endtimepickermenu: false,
    formData: {
      scheduledate: new Date().toISOString().substr(0, 10),
      starttime: null,
      endtime: null,
      clinic: null,
    },
    defaultVals: {
      type: null,
      igg: '',
      igm: '',
      image: null,
      covid: '',
    },
    requiredFieldRules: [(v) => !!v || 'This is a required field'],
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
    clinicpickermenu: false,
    cliniccalitems: [],
  }),
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
  },
  methods: {
    getClinics() {
      const app = this
      API.get('/clinics/telemedicine', {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(function (response) {
          if (response.data) {
            app.cliniccalitems = response.data
            app.cliniccalitems.unshift({
              name: 'Medical Square',
              email: 'info@healthquilt.com',
            })
          } else {
            console.log(response)
          }
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    save() {
      let start_datetime =
        this.formData['scheduledate'] + 'T' + this.formData['starttime']
      let end_datetime =
        this.formData['scheduledate'] + 'T' + this.formData['endtime']

      if (this.$refs.scheduleform.validate()) {
        let headers = AuthHelper.getAuthHeaders()
        const app = this

        let formData = {}
        formData = Object.assign({}, this.formData)
        formData['patient_id'] = this.patientId
        formData['patientName'] = this.patientName

        // Needs seconds to submit properly
        formData['start_datetime'] = start_datetime + ':00'
        formData['end_datetime'] = end_datetime + ':00'

        API.post('/schedule_telemedicine/patient', formData, {
          headers: headers,
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Test was added successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
            } else {
              app.snackbarText = 'Could not be added'
              app.snackbarColor = 'red'
              app.snackbar = true
            }
          })
          .catch(function (error) {
            app.snackbarText = error
            app.snackbarColor = 'red'
            app.snackbar = true
          })
        console.log('Form Data', formData)
      }
    },
    close() {
      this.show = false
      setTimeout(() => {
        this.formData = Object.assign({}, this.defaultVals)
      }, 300)
    },
    scheduleTimeStep: (m) => m % 5 === 0,
  },
  props: {
    value: Boolean,
    patientId: String,
    patientName: String,
  },
}
</script>
