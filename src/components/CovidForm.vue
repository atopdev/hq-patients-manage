<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" lg="7" sm="10" md="8">
            <v-card outlined class="elevation-12 form">
              <v-row class="logo">
                <v-img
                  :src="require('../assets/logo.png')"
                  contain
                  height="230"
                />
              </v-row>
              <v-spacer></v-spacer>
              <p class="text-center title mt-5">{{ title }}</p>
              <ConsentForm v-if="consent"> </ConsentForm>
              <v-col v-if="saved">
                <p class="text-center title mt-5">
                  Thank you for submitting your survey.
                </p>
              </v-col>
              <v-form
                ref="form"
                v-if="!consent && !saved"
                id="covid19-form"
                @submit.prevent="validate"
              >
                <v-row v-if="!followup">
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.firstname"
                      :rules="!followup && requiredFieldRules"
                      :label="this.$t('covid19-form.firstname')"
                      required
                      :readonly="true"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.lastname"
                      :rules="!followup && requiredFieldRules"
                      :label="this.$t('covid19-form.lastname')"
                      required
                      :readonly="true"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="formData.temp"
                      :rules="tempRules"
                      :label="this.$t('covid19-form.temp')"
                      type="number"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      {{ this.$t('covid19-form.location-contact-question') }}
                    </p>
                  </v-col>
                </v-row>
                <v-row
                  class="mt-0 pt-0"
                  v-bind:class="{
                    'mb-0 pb-0': index != locationContactOptions.length - 1,
                    'mb-4': index == locationContactOptions.length - 1,
                  }"
                  v-for="(item, index) in locationContactOptions"
                  :key="'locationContact' + index"
                >
                  <v-col
                    class="mt-0 pt-0"
                    v-bind:class="{
                      'mb-0 pb-0': index != locationContactOptions.length - 1,
                    }"
                  >
                    <v-checkbox
                      v-model="formData.locationContact"
                      :label="item.label"
                      :hide-details="index != locationContactOptions.length - 1"
                      :value="item.value"
                      :rules="requireAtLeastOneLocationContact"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <p class="mb-0 pb-0">
                      {{ this.$t('covid19-form.contact-question') }}
                    </p>
                  </v-col>
                  <v-col cols="12 mt-0 pt-0">
                    <v-radio-group
                      v-model="formData.contact"
                      :rules="requiredYesNoFieldRules"
                      :mandatory="true"
                    >
                      <v-radio
                        v-for="(item, index) in yesNoOptions"
                        :key="'contact' + index"
                        :items="yesNoOptions"
                        :label="item.label"
                        :value="item.value"
                      ></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      {{ this.$t('covid19-form.symptoms-question') }}
                    </p>
                  </v-col>
                </v-row>
                <v-row
                  class="mt-0 pt-0"
                  v-bind:class="{
                    'mb-0 pb-0': index != symptomsOptions.length - 1,
                    'mb-4': index == symptomsOptions.length - 1,
                  }"
                  v-for="(item, index) in symptomsOptions"
                  :key="'symptom' + index"
                >
                  <v-col
                    class="mt-0 pt-0"
                    v-bind:class="{
                      'mb-0 pb-0': index != symptomsOptions.length - 1,
                    }"
                  >
                    <v-checkbox
                      v-model="formData.symptoms"
                      :label="item.label"
                      :hide-details="index != symptomsOptions.length - 1"
                      :value="item.value"
                      :rules="requireAtLeastOneSymptom"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      {{ this.$t('covid19-form.signs-question') }}
                    </p>
                  </v-col>
                </v-row>
                <v-row
                  v-bind:class="{
                    'mb-0 pb-0': index != additionalSignsOptions.length - 1,
                    'mb-4': index == additionalSignsOptions.length - 1,
                  }"
                  v-for="(item, index) in additionalSignsOptions"
                  :key="'sign' + index"
                >
                  <v-col
                    class="mt-0 pt-0"
                    v-bind:class="{
                      'mb-0 pb-0': index != additionalSignsOptions.length - 1,
                    }"
                  >
                    <v-checkbox
                      v-model="formData.additionalSigns"
                      :label="item.label"
                      :hide-details="index != additionalSignsOptions.length - 1"
                      :value="item.value"
                      :rules="requireAtLeastOneSign"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      {{ this.$t('covid19-form.additional-signs-question') }}
                    </p>
                  </v-col>
                  <v-col cols="12 mt-0 pt-0">
                    <v-text-field
                      v-model="formData.additionalSignsOther"
                      label="Your Answer"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row v-if="!followup">
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      {{ this.$t('covid19-form.conditions-question') }}
                    </p>
                  </v-col>
                  <v-col cols="12 mt-0 pt-0">
                    <v-radio-group
                      v-model="formData.condition"
                      :rules="!followup && requiredYesNoFieldRules"
                      :required="!followup"
                      :mandatory="!followup"
                    >
                      <v-radio
                        v-for="(item, index) in yesNoOptions"
                        :key="'contact' + index"
                        :items="yesNoOptions"
                        :label="item.label"
                        :value="item.value"
                      ></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>

                <v-row v-if="!followup">
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      {{ this.$t('covid19-form.list-conditions') }}
                    </p>
                  </v-col>
                  <v-col cols="12 mt-0 pt-0">
                    <v-text-field
                      v-model="formData.conditions"
                      label="Your Answer"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-btn
                      block
                      tile
                      color="#6658dd"
                      dark
                      type="submit"
                      form="covid19-form"
                      @click="submition_check()"
                      >Submit
                    </v-btn>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="10" offset="1" tile>
                    <p class="caption text-center">
                      We care about your privacy. If you would like to know more
                      about how we protect your confidential information, please
                      read our
                      <a
                        href="https://d68a2677-c2d3-4f26-8b15-2f6e98d6832c.filesusr.com/ugd/e48917_9f481877816441289905824337a48bd9.pdf"
                        >Notice of Privacy Practices</a
                      >
                    </p>
                  </v-col>
                  <v-col cols="2"></v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

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
    </v-content>
  </v-app>
</template>

<style scoped>
.container {
  background: #6658dd;
}
.form {
  padding: 80px;
  background: #ffffff url('../assets/bg-pattern.png');
  background-size: cover;
  background-repeat: no-repeat;
}

@media only screen and (max-width: 600px) {
  .form {
    padding: 20px !important;
  }
}
</style>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import ConsentForm from '@/components/ConsentForm'
export default {
  components: {
    ConsentForm,
  },
  created: function () {
    const patientId = this.$route.query.p
    const followup = this.$route.query.f
    if (patientId) {
      this.formData.id = patientId
    } else {
      window.location.replace('#/')
    }

    if (followup == '1') {
      this.followup = true
    }

    const app = this
    API.get('formpatient/' + this.$route.query.p, {
      headers: AuthHelper.getAuthHeaders(),
    })
      .then(function (response) {
        app.formData.firstname = response.data.patient.firstname
        app.formData.lastname = response.data.patient.lastname
        app.consent = !response.data.patient.consent
        app.$i18n.locale = response.data.patient.primaryLanguage
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  data: () => ({
    consent: false,
    valid: false,
    followup: false,
    saved: false,
    formData: {
      id: '',
      phone: '',
      email: '',
      employer: '',
      dob: '',
      firstname: '',
      lastname: '',
      temp: '',
      locationContact: [],
      contact: false,
      symptoms: [],
      additionalSigns: [],
      additionalSignsOther: '',
      condition: false,
      conditions: '',
    },
    dobMenu: false,
    requiredFieldRules: [(v) => !!v || 'This is a required field'],
    requiredEmailFieldRules: [
      (v) => !!v || 'This is a required field',
      (v) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(v) || 'E-mail must be valid'
      },
    ],
    requiredYesNoFieldRules: [(v) => v !== null || 'Please select one'],
    phoneRules: [
      (v) =>
        (!isNaN(parseInt(v)) && v.length == 10) ||
        'Phone number must be 10 digits no spaces or other charaters',
    ],
    tempRules: [
      (v) =>
        (RegExp(/^\d{2,3}(\.\d)?$/).test(v) &&
          parseFloat(v) >= 80 &&
          parseFloat(v) <= 110.9) ||
        'Temperature is in Fahrenheit and should between 80.0 and 110.9',
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
    locationContactOptions() {
      return [
        {
          label: this.$t('covid19-form.int-travel'),
          value: this.$t('covid19-form.int-travel', 'en'),
        },
        {
          label: this.$t('covid19-form.nursing-home'),
          value: this.$t('covid19-form.nursing-home', 'en'),
        },
        {
          label: this.$t('covid19-form.meat-packing'),
          value: this.$t('covid19-form.meat-packing', 'en'),
        },
        {
          label: this.$t('covid19-form.domestic-travel'),
          value: this.$t('covid19-form.domestic-travel', 'en'),
        },
        {
          label: this.$t('covid19-form.prison'),
          value: this.$t('covid19-form.prison', 'en'),
        },
        {
          label: this.$t('covid19-form.none'),
          value: this.$t('covid19-form.none', 'en'),
        },
      ]
    },
    symptomsOptions() {
      return [
        {
          label: this.$t('covid19-form.fever'),
          value: this.$t('covid19-form.fever', 'en'),
        },
        {
          label: this.$t('covid19-form.cough'),
          value: this.$t('covid19-form.cough', 'en'),
        },
        {
          label: this.$t('covid19-form.shortnet-breath'),
          value: this.$t('covid19-form.shortnet-breath', 'en'),
        },
        {
          label: this.$t('covid19-form.chills'),
          value: this.$t('covid19-form.chills', 'en'),
        },
        {
          label: this.$t('covid19-form.shaking-chills'),
          value: this.$t('covid19-form.shaking-chills', 'en'),
        },
        {
          label: this.$t('covid19-form.muscle-pain'),
          value: this.$t('covid19-form.muscle-pain', 'en'),
        },
        {
          label: this.$t('covid19-form.headache'),
          value: this.$t('covid19-form.headache', 'en'),
        },
        {
          label: this.$t('covid19-form.sore-throat'),
          value: this.$t('covid19-form.sore-throat', 'en'),
        },
        {
          label: this.$t('covid19-form.loss-taste-smell'),
          value: this.$t('covid19-form.loss-taste-smell', 'en'),
        },
        {
          label: this.$t('covid19-form.none'),
          value: this.$t('covid19-form.none', 'en'),
        },
      ]
    },
    additionalSignsOptions() {
      return [
        {
          label: this.$t('covid19-form.vomiting'),
          value: this.$t('covid19-form.vomiting', 'en'),
        },
        {
          label: this.$t('covid19-form.abdominal'),
          value: this.$t('covid19-form.abdominal', 'en'),
        },
        {
          label: this.$t('covid19-form.diarrhea'),
          value: this.$t('covid19-form.diarrhea', 'en'),
        },
        {
          label: this.$t('covid19-form.other'),
          value: this.$t('covid19-form.other', 'en'),
        },
        {
          label: this.$t('covid19-form.fatigue'),
          value: this.$t('covid19-form.fatigue', 'en'),
        },
        {
          label: this.$t('covid19-form.chest-tightness'),
          value: this.$t('covid19-form.chest-tightness', 'en'),
        },
        {
          label: this.$t('covid19-form.wheezing'),
          value: this.$t('covid19-form.wheezing', 'en'),
        },
        {
          label: this.$t('covid19-form.skin-conditions'),
          value: this.$t('covid19-form.skin-conditions', 'en'),
        },
        {
          label: this.$t('covid19-form.neck-pain'),
          value: this.$t('covid19-form.neck-pain', 'en'),
        },
        {
          label: this.$t('covid19-form.none'),
          value: this.$t('covid19-form.none', 'en'),
        },
      ]
    },
    yesNoOptions() {
      return [
        { label: this.$t('covid19-form.yes'), value: true },
        { label: this.$t('covid19-form.no'), value: false },
      ]
    },
    requireAtLeastOneSymptom() {
      return [
        (this.formData.symptoms.includes(this.$t('covid19-form.none', 'en')) &&
          this.formData.symptoms.length == 1) ||
          (!this.formData.symptoms.includes(
            this.$t('covid19-form.none', 'en')
          ) &&
            this.formData.symptoms.length > 0) ||
          'None of the above cannot be combined with other selections, select at least one item',
      ]
    },
    requireAtLeastOneSign() {
      return [
        (this.formData.additionalSigns.includes(
          this.$t('covid19-form.none', 'en')
        ) &&
          this.formData.additionalSigns.length == 1) ||
          (!this.formData.additionalSigns.includes(
            this.$t('covid19-form.none', 'en')
          ) &&
            this.formData.additionalSigns.length > 0) ||
          'None of the above cannot be combined with other selections, select at least one item',
      ]
    },
    requireAtLeastOneLocationContact() {
      return [
        (this.formData.locationContact.includes(
          this.$t('covid19-form.none', 'en')
        ) &&
          this.formData.locationContact.length == 1) ||
          (!this.formData.locationContact.includes(
            this.$t('covid19-form.none', 'en')
          ) &&
            this.formData.locationContact.length > 0) ||
          'None of the above cannot be combined with other selections, select at least one item',
      ]
    },
  },
  watch: {
    dobMenu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    },
  },
  methods: {
    save(date) {
      this.$refs.dobMenu.save(date)
    },
    submition_check() {
      if (
        this.requireAtLeastOneSymptom[0] ==
          'None of the above cannot be combined with other selections, select at least one item' ||
        this.requireAtLeastOneSign ==
          'None of the above cannot be combined with other selections, select at least one item' ||
        this.requireAtLeastOneLocationContact ==
          'None of the above cannot be combined with other selections, select at least one item' ||
        this.formData.temp == ''
      ) {
        this.snackbarText =
          'Please fill out all required fields before submitting'
        this.snackbarColor = 'error'
        this.snackbar = true
      }
    },
    validate() {
      if (this.$refs.form.validate()) {
        const app = this
        let endpoint = 'covid19'
        if (this.followup) {
          endpoint = 'covid19/followup'
        }
        API.post(endpoint, this.formData)
          .then(function (response) {
            if (response.data['success']) {
              app.snackbarText = 'We got your response. Thank you!'
              app.snackbarColor = 'success'
              app.snackbar = false
              app.saved = true
              app.$refs.form.reset()
            } else {
              app.snackbarText = 'Something went wrong!'
              app.snackbarColor = 'error'
              app.snackbar = true
            }
          })
          .catch(function (error) {
            app.snackbarText =
              'There wes an error, please check the fields and submit again.'
            app.snackbarColor = 'error'
            app.snackbar = true
            console.log(error)
          })
      }
    },
  },
}
</script>
