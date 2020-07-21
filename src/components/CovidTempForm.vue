<template>
  <v-app>
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" lg="7" sm="10" md="8">
            <v-card outlined class="elevation-12 form">
              <v-form ref="form" id="covid19-form" @submit.prevent="validate">
                <v-row class="logo">
                  <v-img
                    :src="require('../assets/logo.png')"
                    contain
                    height="230"
                  />
                </v-row>
                <v-spacer></v-spacer>
                <p class="text-center title mt-5">{{ title }}</p>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model.number="formData.temp"
                      :rules="requiredFieldRules"
                      label="Body Temprature"
                      type="number"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <p class="mb-0 pb-0">
                      Have you had known contact* with a person who is under
                      investigation or tested positve for 2019-nCov? *
                    </p>
                  </v-col>
                  <v-col cols="12 mt-0 pt-0">
                    <v-select
                      v-model="formData.contact"
                      :items="yesNoOptions"
                      item-text="text"
                      item-value="value"
                      label="Please select one"
                      :rules="requiredYesNoFieldRules"
                      required
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      Do you have any of the following signs and/or symptoms?
                      Please check all that apply. *
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
                      :label="item"
                      :hide-details="index != symptomsOptions.length - 1"
                      :value="item"
                      :rules="requireAtLeastOneSymptom"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      Do you have any additional signs and/or symptoms? Please
                      check all that apply
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
                      :label="item"
                      :hide-details="index != additionalSignsOptions.length - 1"
                      :value="item"
                      :rules="requireAtLeastOneSign"
                    ></v-checkbox>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" class="pb-0">
                    <p class="mb-0 pb-0">
                      Any Other additional signs and/or symptoms?
                    </p>
                  </v-col>
                  <v-col cols="12 mt-0 pt-0">
                    <v-text-field
                      v-model="formData.additionalSignsOther"
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
export default {
  created: function () {
    // if(this.$route.query.token === undefined) {
    //   window.location = 'http://healthquilt.com'
    // }
    this.formData.phone = this.$route.query.phone
    this.formData.id = this.$route.query.p
  },
  data: () => ({
    valid: false,
    formData: {
      temp: '',
      id: '',
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
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        const app = this
        API.post('covid19/temp', this.formData)
          .then(function (response) {
            if (response.data['success']) {
              app.snackbarText = 'We got your response. Thank you!'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.$refs.form.reset()
            } else {
              app.snackbarText = 'Something went wrong!'
              app.snackbarColor = 'error'
              app.snackbar = true
            }
          })
          .catch(function (error) {
            app.snackbarText = 'There wes an error. Please try again.'
            app.snackbarColor = 'error'
            app.snackbar = true
            console.log(error)
          })
      }
    },
  },
}
</script>
