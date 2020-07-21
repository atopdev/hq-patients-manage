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
  name: 'TestSOAPFormDialog',
  data: () => ({
    formData: {
      subjective: 'Patient requests COVID test',
      objective: '',
      assessment: '',
      orders: '',
      workstatus: null,
    },
    soapTestsIndex: [],
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
    statusOptions: [
      { label: 'No', value: '' },
      { label: 'Yes', value: 'verified' },
    ],
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
      const { last_response } = this.test
      if (last_response) {
        let subjective = 'Patient requests COVID test'
        if (this.test.last_response.contact) {
          subjective += '\nExposure: Yes'
          this.formData.workstatus = 'quarantine_exposure'
        } else {
          subjective += '\nExposure: No'
        }
        if (last_response.travel) {
          subjective += '\nTravel: Yes'
        }
        if (
          last_response.locationContact &&
          !last_response.locationContact.includes('None of the above')
        ) {
          subjective += '\nContact: ' + last_response.locationContact.join(', ')
          this.formData.workstatus = 'quarantine_exposure'
        }
        this.formData.subjective = subjective

        let objective =
          'Temperature: ' + parseFloat(last_response.temp).toFixed(2) + '\n'
        if (last_response.symptoms.indexOf('None of the above') < 0) {
          objective += 'Symptoms: ' + last_response.symptoms.join(', ')
        }
        this.formData.objective = objective
      }

      let assessment = ''
      if (this.test.type === 'covid19') {
        switch (this.test.covid) {
          case 'Positive':
          case 'positive':
          case '+':
            this.assessmentLabel = 'COVID-19 (+)'
            assessment = 'COVID-19 (+)\n'
            assessment += 'Self-Quarantine until Covid-19 test negative\n'
            assessment += 'We will be scheduling a telemedicine visit\n'
            assessment +=
              'You will a receive a daily survey for temperature and symptoms\n'
            this.formData.workstatus = 'quarantine_covid19_positive'
            break
          case 'Negative':
          case 'negative':
          case '-':
            this.assessmentLabel = 'COVID-19 (-)'
            assessment = 'COVID-19 (-)\n'
            assessment +=
              'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
            break
          case 'Indeterminate':
            this.assessmentLabel = 'COVID-19 (Indeterminate)'
            assessment = 'COVID-19 (Indeterminate)\n'
            assessment += 'Self-Quarantine until Covid-19 test negative\n'
            assessment += 'We will be scheduling a telemedicine visit\n'
            assessment +=
              'You will a receive a daily survey for temperature and symptoms\n'
            this.formData.workstatus = 'quarantine_covid19_positive'
            break
          default:
            break
        }
      } else if (this.test.type === 'antibody') {
        const igmPositive =
          this.test.igm == 'positive' ||
          this.test.igm == 'Positive' ||
          this.test.igm == '+'
        const iggPositive =
          this.test.igg == 'positive' ||
          this.test.igg == 'Positive' ||
          this.test.igg == '+'
        const igmText = igmPositive ? 'IgM (+)' : 'IgM (-)'
        const iggText = iggPositive ? 'IgG (+)' : 'IgG (-)'
        assessment += `${igmText} & ${iggText} = `
        this.assessmentLabel = igmText + ' ' + iggText

        if (igmPositive && !iggPositive) {
          assessment += 'Potentially Infected, Not Immune\n'
          assessment +=
            'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
          this.formData.workstatus = 'quarantine_igm_positive'
        } else if (!igmPositive && !iggPositive) {
          assessment += 'Not Infected, Not Immune\n'
          assessment +=
            'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        } else if (igmPositive && iggPositive) {
          assessment += 'Potentially Recent / Current, Immune likely\n'
          assessment += 'Self-Quarantine until Covid-19 test negative\n'
          assessment += 'We will be scheduling a telemedicine visit\n'
          assessment +=
            'You will a receive a daily survey for temperature and symptoms\n'
          this.formData.workstatus = 'quarantine_igm_positive'
        } else if (!igmPositive && iggPositive) {
          assessment += 'Not infected, Immune likely\n'
          assessment +=
            'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        }
      }

      assessment +=
        'Continue to wash your hands, practice social distancing, wear a mask\n'

      this.formData.assessment = assessment
    },
    save() {
      if (this.$refs.soapForm.validate()) {
        let headers = AuthHelper.getAuthHeaders()

        let formData = {}
        formData = Object.assign({}, this.formData)
        formData['patient_id'] = this.test.patient_id.$oid
        formData['test_id'] = this.test._id.$oid

        API.post('encounter', formData, {
          headers: headers,
        })
          .then(({ data }) => {
            if (data.success) {
              this.snackbarText = 'Test SOAP note saved successfully'
              this.snackbarColor = 'success'
              this.snackbar = true
              this.$emit('close', { success: true, encounter: data.encounter })
            } else {
              throw new Error('Could not be saved')
            }
          })
          .catch((error) => {
            this.snackbarText = error
            this.snackbarColor = 'red'
            this.snackbar = true
            this.$emit('close', { success: false })
          })
      }
    },
    close() {
      this.show = false
    },
  },
  props: {
    value: Boolean,
    test: Object,
  },
}
</script>
