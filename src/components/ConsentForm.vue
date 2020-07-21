<template>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-form
          ref="consentForm"
          id="patientagreement-form"
          @submit.prevent="validate"
        >
          <v-row>
            <v-col cols="12" class="pb-0">
              <p class="mb-0 pb-0">{{ $t('consent-form.check-all') }}</p>
            </v-col>
          </v-row>
          <v-row
            class="mt-0 pt-0"
            v-bind:class="{
              'mb-0 pb-0': index != agreementList.length - 1,
              'mb-4': index == agreementList.length - 1,
            }"
            v-for="(item, index) in agreementList"
            :key="'agreement' + index"
          >
            <v-col
              class="mt-0 pt-0"
              v-bind:class="{ 'mb-0 pb-0': index != agreementList.length - 1 }"
            >
              <v-checkbox
                v-model="formData.agreements"
                :label="item"
                :hide-details="index != agreementList.length - 1"
                :value="index"
                :rules="requireAllAgreements"
                required
              ></v-checkbox>
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
                form="patientagreement-form"
                @click="submit_check()"
                >Submit
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="10" offset="1" tile>
              <p class="caption text-center">
                We care about your privacy. If you would like to know more about
                how we protect your confidential information, please read our
                <a
                  href="https://d68a2677-c2d3-4f26-8b15-2f6e98d6832c.filesusr.com/ugd/e48917_9f481877816441289905824337a48bd9.pdf"
                  >Notice of Privacy Practices</a
                >
              </p>
            </v-col>
            <v-col cols="2"></v-col>
          </v-row>
        </v-form>
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
</template>

<style scoped></style>

<script>
import { API } from '@/api'
export default {
  created: function () {
    const patientId = this.$route.query.p
    if (patientId) {
      this.formData.id = patientId
    }
  },
  data: () => ({
    valid: false,
    formData: {
      agreements: [],
    },
    requiredFieldRules: [
      (v) => (console.log(v) && !!v) || 'This is a required field',
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
    agreementList() {
      return [
        this.$t('consent-form.agreement1'),
        this.$t('consent-form.agreement2'),
        this.$t('consent-form.agreement3'),
        this.$t('consent-form.agreement4'),
        this.$t('consent-form.agreement5'),
      ]
    },
    requireAllAgreements() {
      return [
        this.formData.agreements.length == this.agreementList.length ||
          'All items must be agreed to.',
      ]
    },
  },
  methods: {
    submit_check() {
      if (this.requireAllAgreements[0] == 'All items must be agreed to.') {
        this.snackbarText = 'Please fill out required fields'
        this.snackbarColor = 'error'
        this.snackbar = true
      }
    },
    validate() {
      if (this.$refs.consentForm.validate()) {
        const app = this
        const patientId = this.$route.query.p

        API.post('consent/' + patientId)
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Consent form successfully submitted'
              app.snackbarColor = 'success'
              app.snackbar = true
              setTimeout(function () {
                window.location.reload()
              }, 500)
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
