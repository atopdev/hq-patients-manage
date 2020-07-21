<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Forgot Password</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <blockquote class="blockquote" v-if="success">
                  The email with further instructions was sent to the submitted
                  email address.
                </blockquote>
                <blockquote class="blockquote" v-if="enableActive">
                  Your account has not been activated yet. Please click
                  <router-link
                    class="blue--text"
                    :to="{
                      path: 'signup',
                      query: { p: patientId, token: activationToken },
                    }"
                    >here</router-link
                  >
                  to activate your account.
                </blockquote>
                <blockquote class="blockquote" v-if="enableAskActive">
                  Please contact a HealthQuilt representative to activate your
                  administrative account at
                  <a class="blue--text" href="mailto:contactus@healthquilt.com"
                    >contactus@healthquilt.com</a
                  >
                </blockquote>
                <v-form
                  id="forgot-password-form"
                  @submit.prevent="submit"
                  v-if="!success && !enableActive && !enableAskActive"
                >
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    name="email"
                    prepend-icon="person"
                    type="text"
                    :rules="requiredEmailFieldRules"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions
                v-if="!success && !enableActive && !enableAskActive"
              >
                <v-spacer />
                <v-btn
                  type="submit"
                  color="primary"
                  class="ma-3"
                  :loading="loading"
                  form="forgot-password-form"
                  >Send</v-btn
                >
              </v-card-actions>
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

<script>
import { API } from '@/api'
export default {
  created: function () {},
  data: () => ({
    formData: {
      email: null,
    },
    loading: false,
    success: false,
    enableActive: false,
    enableAskActive: false,
    patientId: '',
    activationToken: '',
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
    requiredEmailFieldRules: [
      (v) => !!v || 'This is a required field',
      (v) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(v) || 'E-mail must be valid'
      },
    ],
  }),
  methods: {
    submit() {
      const app = this
      this.loading = true
      API.post(
        'reset/send-email',
        {
          email: this.formData.email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((res) => {
          if (res.data.success) {
            app.success = true
          } else {
            if (res.data.is_not_patient) {
              app.enableAskActive = true
            } else {
              app.enableActive = true
              app.patientId = res.data.patient_id
              app.activationToken = res.data.active_token
            }

            app.snackbar = true
            app.snackbarText = 'This account has not been activated yet.'
            app.snackbarColor = 'red'
            app.loading = false
          }
        })
        .catch(function (error) {
          console.log(error)
          app.snackbar = true
          app.snackbarText = 'Please make sure you entered a valid email.'
          app.snackbarColor = 'red'
          app.loading = false
        })
    },
  },
}
</script>
