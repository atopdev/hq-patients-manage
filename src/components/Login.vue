<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-container class="logo my-5">
              <v-img
                :src="require('../assets/logo.png')"
                contain
                height="250"
              />
            </v-container>
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Login</v-toolbar-title>
                <v-spacer />
              </v-toolbar>

              <v-card-text>
                <v-form id="login-form" @submit.prevent="login">
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    name="email"
                    prepend-icon="person"
                    type="text"
                    :rules="requiredEmailFieldRules"
                  />

                  <v-text-field
                    v-model="formData.password"
                    id="password"
                    label="Password"
                    name="password"
                    prepend-icon="lock"
                    type="password"
                    required
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn text to="/forgot-password" class="ma-3"
                  >Forgot Password</v-btn
                >
                <v-spacer />
                <v-btn
                  type="submit"
                  color="primary"
                  class="ma-3"
                  :loading="loading"
                  form="login-form"
                  >Login</v-btn
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
import AuthHelper from '@/helpers/AuthHelper'
export default {
  created: function () {},
  data: () => ({
    formData: {
      email: null,
      password: null,
    },
    loading: false,
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
    login() {
      const app = this
      this.loading = true
      AuthHelper.login(this.formData.email, this.formData.password).then(
        (loggedIn) => {
          if (loggedIn) {
            let redirect = '/login'
            const user = AuthHelper.loggedIn()
            if (user.roles.includes('patient')) {
              redirect = '/portal'
            } else {
              redirect = '/responses'
            }
            setTimeout(function () {
              app.$router.push(redirect).catch((err) => {
                console.log(err)
              })
            }, 200)
          } else {
            app.snackbar = true
            app.snackbarText = 'Invalid email or password'
            app.snackbarColor = 'red'
            app.loading = false
          }
        },
        (err) => {
          console.log(err)
          app.snackbar = true
          app.snackbarText = 'Something went wrong, try again'
          app.snackbarColor = 'red'
          app.loading = false
        }
      )
    },
  },
}
</script>
