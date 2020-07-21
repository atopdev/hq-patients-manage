<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">SOAP Form</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form id="soap" ref="soapForm" @submit.prevent="validate">
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.subjective"
                  :rules="requiredFieldRules"
                  label="Subjective"
                  required
                  :auto-grow="true"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.objective"
                  :rules="requiredFieldRules"
                  label="Objective"
                  required
                  :auto-grow="true"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <p v-if="assessmentLabel != ''">
                  Test results: {{ assessmentLabel }}
                </p>
                <v-textarea
                  v-model="formData.assessment"
                  :rules="requiredFieldRules"
                  label="Assessment and Plan"
                  required
                  :auto-grow="true"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.orders"
                  :rules="requiredFieldRules"
                  label="Orders"
                  required
                  :auto-grow="true"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-radio-group
                  v-model="formData.workstatus"
                  :rules="requiredYesNoFieldRules"
                  :required="true"
                  :mandatory="true"
                >
                  <v-radio
                    v-for="(item, index) in workStatuses"
                    :key="'workStatus' + index"
                    :items="workStatuses"
                    :label="item.label"
                    :value="item.value"
                  ></v-radio>
                </v-radio-group>
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
export default {
  created() {},
  name: 'SOAPFormDialog',
  data: () => ({
    formData: {
      subjective: 'Patient requests COVID test',
      objective: '',
      assessment: '',
      orders: '',
      workstatus: null,
    },
    workStatuses: [
      {
        label: 'Return to Work',
        value: 'cleared',
      },
      {
        label: 'Quarantine: Exposure',
        value: 'quarantine_exposure',
      },
      {
        label: 'Quarantine: IgM positive',
        value: 'quarantine_igm_positive',
      },
      {
        label: 'Quarantine: COVID-19 positive',
        value: 'quarantine_covid19_positive',
      },
      {
        label: 'Stay at home due to risk / illness',
        value: 'stay_at_home',
      },
    ],
    assessmentLabel: '',
    requiredYesNoFieldRules: [(v) => v !== null || 'Please select one'],
    requiredFieldRules: [(v) => !!v || 'This is a required field'],
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
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
  watch: {
    show(val) {
      if (val == false) {
        setTimeout(() => {
          this.$refs.soapForm.reset()
        }, 300)
      } else {
        this.populateFields()
      }
    },
  },
  methods: {
    populateFields() {
      let response = null
      let symptoms = null
      let covidTest = null
      let abTest = null

      if (
        this.patient &&
        this.patient.response &&
        this.patient.response.length
      ) {
        response = this.patient.response[0]
        if (!response.symptoms.includes('None of the above')) {
          symptoms = response.symptoms
        }
      }
      if (this.patient && this.patient.tests && this.patient.tests.length) {
        const antibodyTests = this.patient.tests.filter(
          (t) => t.type == 'antibody'
        )
        const covidTests = this.patient.tests.filter((t) => t.type == 'covid19')
        abTest = antibodyTests[antibodyTests.length - 1]
        covidTest = covidTests[covidTests.length - 1]
      }

      if (response) {
        let subjective = 'Patient requests COVID test'
        if (response.contact) {
          subjective += '\nExposure: Yes'
          this.formData.workstatus = 'quarantine_exposure'
        } else {
          subjective += '\nExposure: No'
        }
        if (response.travel) {
          subjective += '\nTravel: Yes'
        }

        if (responses.locationContact) {
          subjective += '\nContact: ' + responses.locationContact.join(', ')
        }
        this.formData.subjective = subjective

        let objective = ''
        objective +=
          'Temperature: ' + parseFloat(response.temp).toFixed(2) + '\n'
        if (symptoms) {
          objective += 'Symptoms: ' + symptoms.join(', ')
        }
        this.formData.objective = objective
      }

      if (abTest && abTest.igm == 'Positive') {
        this.formData.workstatus = 'quarantine_igm_positive'
      }

      let assessment = ''
      if (
        abTest &&
        abTest.igm == 'Positive' &&
        abTest &&
        abTest.igg == 'Negative'
      ) {
        this.assessmentLabel =
          'IgM (+) & IgG (-) = Potentially Infected, Not Immune'
        assessment += 'IgM (+) & IgG (-) = Potentially Infected, Not Immune\n'
        assessment += 'Self-Quarantine until Covid-19 test negative\n'
        assessment += 'We will be scheduling a telemedicine visit\n'
        assessment +=
          'You will a receive a daily survey for temperature and symptoms\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (
        abTest &&
        abTest.igm == 'Negative' &&
        abTest &&
        abTest.igg == 'Negative'
      ) {
        this.assessmentLabel = 'IgM (-) & IgG (-) = Not Infected, Not Immune'
        assessment += 'IgM (-) & IgG (-) = Not Infected, Not Immune\n'
        assessment +=
          'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (
        abTest &&
        abTest.igm == 'Positive' &&
        abTest &&
        abTest.igg == 'Positive'
      ) {
        this.assessmentLabel =
          'IgM (+) & IgG (+) = Potentially Recent / current, Immune likely'
        assessment +=
          'IgM (+) & IgG (+) = Potentially Recent / current, Immune likely\n'
        assessment += 'Self-Quarantine until Covid-19 test negative\n'
        assessment += 'We will be scheduling a telemedicine visit\n'
        assessment +=
          'You will a receive a daily survey for temperature and symptoms\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (
        abTest &&
        abTest.igm == 'Negative' &&
        abTest &&
        abTest.igg == 'Positive'
      ) {
        this.assessmentLabel =
          'IgM (-) & IgG (+) = Not infected, Immune likely\n'
        assessment += 'IgM (-) & IgG (+) = Not infected, Immune likely'
        assessment +=
          'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (covidTest && covidTest.covid == 'Positive') {
        this.formData.workstatus = 'quarantine_covid19_positive'
        this.assessmentLabel = 'COVID-19 (+)'
        assessment += 'COVID-19 (+)'
        assessment += 'Self-Quarantine until Covid-19 test negative\n'
        assessment += 'We will be scheduling a telemedicine visit\n'
        assessment +=
          'You will a receive a daily survey for temperature and symptoms\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (covidTest && covidTest.covid == 'Negative') {
        this.assessmentLabel = 'COVID-19 (-)'
        assessment += 'COVID-19 (-)\n'
        assessment +=
          'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      }
    },
    save() {
      if (this.$refs.soapForm.validate()) {
        let headers = AuthHelper.getAuthHeaders()
        const app = this

        let formData = {}
        formData = Object.assign({}, this.formData)
        formData['id'] = this.patient._id.$oid

        API.post('soap', formData, {
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
      }
    },
    close() {
      this.show = false
    },
  },
  props: {
    value: Boolean,
    patient: Object,
  },
}
</script>
