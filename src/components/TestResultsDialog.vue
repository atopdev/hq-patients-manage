<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline" v-if="!test">Add Test Result</span>
        <span class="headline" v-else="">Edit Test Result</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form id="testForm" ref="testForm" @submit.prevent="validate">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="formData.type"
                  :items="testTypes"
                  item-text="text"
                  item-value="value"
                  label="Please select one"
                  :rules="requiredFieldRules"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" v-if="formData.type">
                <date-picker
                  v-model="formData.scheduled_datetime"
                  label="Scheduled date of testing"
                  append-icon
                />
              </v-col>
              <v-col cols="12" v-if="formData.type && test">
                <date-picker
                  v-model="formData.administered_datetime"
                  label="Administered date of testing"
                  append-icon
                />
              </v-col>
            </v-row>
            <v-row v-if="formData.type == 'antibody'">
              <v-col cols="12" v-if="test">
                <v-select
                  v-model="selectedDaysActive"
                  :items="daysActiveItems"
                  item-text="text"
                  item-value="value"
                  label="Select active number of days"
                  :rules="requiredFieldRules"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.manuAnti"
                  :items="manufacturerAntibody"
                  item-text="text"
                  item-value="value"
                  :rules="requiredFieldRules"
                  label="Manufacturer"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.methAnti"
                  :items="methodAntibody"
                  item-text="text"
                  item-value="value"
                  :rules="requiredFieldRules"
                  label="Method"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.igg"
                  :items="iggResult"
                  item-text="text"
                  item-value="value"
                  :rules="requiredFieldRules"
                  label="IgG Results"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.igm"
                  :items="igmResult"
                  item-value="value"
                  :rules="requiredFieldRules"
                  label="IgM Results"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <ImageResizeInput
                  v-model="formData.image"
                  ref="fileInput"
                ></ImageResizeInput>
              </v-col>
            </v-row>
            <v-row v-if="formData.type == 'covid19'">
              <v-col cols="12" v-if="test">
                <v-select
                  v-model="selectedDaysActive"
                  :items="daysActiveItems"
                  item-text="text"
                  item-value="value"
                  label="Select active number of days"
                  :rules="requiredFieldRules"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.covid"
                  :items="covidResults"
                  item-text="text"
                  item-value="value"
                  label="Covid test results"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.manuCovid"
                  :items="manufacturerCovid"
                  item-text="text"
                  item-value="value"
                  :rules="requiredFieldRules"
                  label="Manufacturer"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="formData.methCovid"
                  :items="methodCovid"
                  item-text="text"
                  item-value="value"
                  :rules="requiredFieldRules"
                  label="Method"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  ref="fileInput"
                  chips
                  accept="application/pdf"
                  label="PDF File"
                  v-model="formData.pdf"
                  value="formData.pdf"
                >
                  <template v-slot:selection="{ index, text }">
                    <v-chip>
                      {{ text || formData.pdf }}
                    </v-chip>
                  </template>
                </v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="save"
          type="submit"
          form="form"
          v-if="!test"
          >Add</v-btn
        >
        <v-btn
          color="blue darken-1"
          text
          @click="update"
          type="submit"
          form="form"
          v-else=""
          >Update</v-btn
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
import {
  COVID_RESULTS,
  ACTIVE_DAYS,
  METHOD_ANTIBODY,
  METHOD_COVID,
  MANUFACTURER_COVID,
  MANUFACTURER_ANTIBODY,
  IGM_IGG_RESULT,
  TEST_TYPES,
} from '@/helpers/values'
import ImageResizeInput from '@/components/ImageResizeInput'
import DatePicker from '@/components/DatePicker'
export default {
  components: {
    ImageResizeInput,
    DatePicker,
  },
  created() {},
  name: 'TestResultsDialog',
  data: () => ({
    covidResults: COVID_RESULTS,
    selectedDaysActive: 1,
    daysActiveItems: ACTIVE_DAYS,
    methodAntibody: METHOD_ANTIBODY,
    methodCovid: METHOD_COVID,
    manufacturerCovid: MANUFACTURER_COVID,
    manufacturerAntibody: MANUFACTURER_ANTIBODY,
    igmResult: IGM_IGG_RESULT,
    iggResult: IGM_IGG_RESULT,
    testTypes: TEST_TYPES,
    formData: {
      type: null,
      igg: '',
      igm: '',
      image: null,
      covid: null,
      pdf: null,
      manuAnti: 'HealGen',
      methAnti: 'Fingerstick',
      manuCovid: 'Fulgent',
      methCovid: 'Nasopharyngeal',
      scheduled_datetime: new Date().toISOString().substr(0, 10),
    },
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
          this.resetForm()
        }, 300)
      } else {
        if (this.test) {
          this.populateFields()
        }
      }
    },
  },
  methods: {
    populateFields() {
      let test = this.test
      this.formData.type = test.type
      this.formData.igg = test.igg
      this.formData.igm = test.igm
      this.formData.covid = test.covid
      if (test.scheduled_datetime) {
        this.formData.scheduled_datetime = new Date(
          test.scheduled_datetime.$date
        )
          .toISOString()
          .substr(0, 10)
      }
      if (test.administered_datetime) {
        this.formData.administered_datetime = new Date(
          test.administered_datetime.$date
        )
          .toISOString()
          .substr(0, 10)
      }
      if (test.type === 'covid19') {
        this.selectedDaysActive =
          test.covid == 'positive' ||
          test.covid == 'Positive' ||
          test.covid == '+' ||
          test.covid == 'Indeterminate'
            ? 7
            : 3
        this.formData.manuCovid = test.manufacturer
        this.formData.methCovid = test.method
        this.formData.pdf = test.pdf
      } else if (test.type === 'antibody') {
        this.selectedDaysActive =
          test.igm == 'positive' || test.igm == 'Positive' || test.igm == '+'
            ? 3
            : 1
        this.formData.manuAnti = test.manufacturer
        this.formData.methAnti = test.method
        this.formData.image = test.image
      }
      if (test.patient.schedules.length > 0) {
        this.selectedDaysActive = test.patient.schedules[0].days_active
      }
    },
    async save() {
      const typesRequiringImages = ['antibody']
      const typesRequiringPDF = ['covid19']
      let validImage = false
      if (
        (typesRequiringImages.includes(this.formData.type) &&
          this.formData.image) ||
        !typesRequiringImages.includes(this.formData.type)
      ) {
        validImage = true
      }
      if (!validImage) {
        this.snackbarText = 'You must upload a test image'
        this.snackbarColor = 'red'
        this.snackbar = true
        return
      }
      if (this.$refs.testForm.validate() && validImage) {
        let headers = AuthHelper.getAuthHeaders()
        let formData = new FormData()
        for (let k of Object.keys(this.formData)) {
          if (
            k === 'image' &&
            typesRequiringImages.includes(this.formData.type)
          ) {
            const fileObj = this.dataURItoBlob(this.formData[k])
            formData.append(k, fileObj, this.formData[k].info.name)
          } else if (
            k === 'pdf' &&
            typesRequiringPDF.includes(this.formData.type) &&
            this.formData[k]
          ) {
            const dataUrl = await this.fileToBase64(this.formData[k])
            const PDFBlob = this.dataURItoBlob({ dataUrl })
            formData.append('pdf', PDFBlob, this.formData[k].name)
          } else {
            if (
              typeof this.formData[k] !== 'undefined' &&
              this.formData[k] !== null
            ) {
              formData.append(k, this.formData[k])
            }
          }
        }
        formData.append('patient_id', this.patientId)
        headers['Content-Type'] = 'multipart/form-data'
        const app = this
        API.post('tests/' + this.formData.type, formData, {
          headers: headers,
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Test was added successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.resetForm()
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
    async update() {
      const typesRequiringImages = ['antibody']
      const typesRequiringPDF = ['covid19']
      let validImage = false
      if (
        (typesRequiringImages.includes(this.formData.type) &&
          this.formData.image) ||
        !typesRequiringImages.includes(this.formData.type)
      ) {
        validImage = true
      }
      if (!validImage) {
        this.snackbarText = 'You must upload a test image'
        this.snackbarColor = 'red'
        this.snackbar = true
        return
      }
      if (this.$refs.testForm.validate() && validImage) {
        let headers = AuthHelper.getAuthHeaders()
        let formData = new FormData()
        for (let k of Object.keys(this.formData)) {
          if (
            k === 'image' &&
            typesRequiringImages.includes(this.formData.type) &&
            this.formData.image &&
            this.formData.image !== this.test.image
          ) {
            const fileObj = this.dataURItoBlob(this.formData[k])
            formData.append(k, fileObj, this.formData[k].info.name)
          } else if (
            k === 'pdf' &&
            typesRequiringPDF.includes(this.formData.type) &&
            this.formData[k] &&
            this.formData.pdf !== this.test.pdf
          ) {
            const dataUrl = await this.fileToBase64(this.formData[k])
            const PDFBlob = this.dataURItoBlob({ dataUrl })
            formData.append('pdf', PDFBlob, this.formData[k].name)
          } else {
            if (
              typeof this.formData[k] !== 'undefined' &&
              this.formData[k] !== null
            ) {
              formData.append(k, this.formData[k])
            }
          }
        }
        formData.append('patient_id', this.test.patient_id.$oid)
        formData.append('_id', this.test._id.$oid)
        API.post(
          '/survey/schedule',
          {
            days_active: this.selectedDaysActive,
            patient_id: this.test.patient_id.$oid,
            survey_type: 'covid19',
            is_overwritten: true,
          },
          {
            headers: headers,
          }
        )
          .then((response) => {
            if (response.data.success) {
              this.snackbarText = 'Schedule has been updated'
              this.snackbarColor = 'success'
              this.snackbar = true
            } else {
              this.snackbarText = 'Schedule could not be saved'
              this.snackbarColor = 'red'
              this.snackbar = true
            }
          })
          .catch((error) => {
            this.snackbarText = error
            this.snackbarColor = 'red'
            this.snackbar = true
          })
        headers['Content-Type'] = 'multipart/form-data'
        const app = this
        API.put('tests/' + this.formData.type, formData, {
          headers: headers,
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Test was updated successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.$emit('updated')
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
      this.show = false
    },
    fileToBase64(file) {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (ev) => {
          resolve(ev.target.result)
        }
        reader.readAsDataURL(file)
      })
    },
    dataURItoBlob(file) {
      const dataURI = file.dataUrl
      const byteString = atob(dataURI.split(',')[1])
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: mimeString })
    },
    resetForm() {
      this.$refs.testForm.reset()
      this.formData.image = null
      this.formData.covid = null
      this.formData.manuAnti = 'HealGen'
      this.formData.methAnti = 'Fingerstick'
      this.formData.manuCovid = 'Fulgent'
      this.formData.methCovid = 'Nasopharyngeal'
    },
  },
  props: {
    value: Boolean,
    patientId: { type: String, required: false },
    test: { type: Object, required: false },
  },
}
</script>
