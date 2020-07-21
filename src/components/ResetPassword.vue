<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Reset Password</v-toolbar-title>
                <v-spacer />
              </v-toolbar>
              <v-card-text>
                <v-form
                  ref="passwordForm"
                  id="password-form"
                  @submit.prevent="setPassword"
                >
                  <v-text-field
                    v-model="email"
                    :label="$t('account-activation.email')"
                    name="email"
                    prepend-icon="person"
                    type="text"
                    readonly
                  />

                  <v-text-field
                    v-model="formData.password"
                    :label="$t('account-activation.password')"
                    name="password"
                    prepend-icon="lock"
                    type="password"
                    required
                    :rules="requiredField"
                  />
                  <v-text-field
                    v-model="passwordRepeat"
                    :label="$t('account-activation.confirm-password')"
                    name="password"
                    prepend-icon="lock"
                    type="password"
                    required
                    :rules="matchingPassword"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn
                  v-if="!readyToLogin"
                  type="submit"
                  color="primary"
                  class="ma-3"
                  :loading="loading"
                  form="password-form"
                  >Reset password</v-btn
                >
                <v-btn
                  link
                  to="/login"
                  v-if="readyToLogin"
                  color="primary"
                  class="ma-3"
                  >{{ $t('account-activation.go-to-login') }}</v-btn
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
  created: function () {
    if (this.$route.query.token == undefined) {
      window.location.replace('#/')
    }
    const app = this
    API.get('/reset/check?token=' + this.$route.query.token, {
      headers: {},
    })
      .then(function (response) {
        app.email = response.data.email
      })
      .catch(function (error) {
        console.log(error)
        app.snackbar = true
        app.snackbarText = 'Invalid Token'
        app.snackbarColor = 'red'
        setTimeout(() => {
          app.$router.push('/')
        }, 500)
      })
  },
  data: () => ({
    formData: {
      password: null,
    },
    email: '',
    passwordRepeat: '',
    readyToLogin: false,
    loading: false,
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),
  computed: {
    requiredField() {
      return [
        (v) => !!v || this.$t('account-activation.password-required'),
        (v) =>
          (v && v.length > 6) ||
          this.$t('account-activation.password-too-short'),
      ]
    },
    matchingPassword() {
      return [
        () =>
          this.formData.password === this.passwordRepeat ||
          this.$t('account-activation.password-doesnt-match'),
        (v) => !!v || this.$t('account-activation.confirm-password-required'),
      ]
    },
  },
  methods: {
    setPassword() {
      if (this.$refs.passwordForm.validate()) {
        const app = this
        this.loading = true
        const data = {
          token: this.$route.query.token,
          ...this.formData,
        }
        API.post('/reset/password', data, {
          headers: {},
        })
          .then(function (response) {
            app.loading = false
            if (response.data && response.data.success) {
              app.snackbar = true
              app.snackbarText = 'Password Reset Successful'
              app.snackbarColor = 'green'
              app.readyToLogin = true
            } else {
              app.snackbar = true
              app.snackbarText = 'Password Reset Failed'
              app.snackbarColor = 'red'
            }
          })
          .catch(function (error) {
            app.loading = false
            console.log(error)
          })
      }
    },
  },
}
</script>
