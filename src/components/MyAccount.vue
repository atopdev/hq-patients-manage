<template>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12 pa-3">
            <v-card-text>
              <v-progress-linear
                v-if="loadingProfile"
                indeterminate
                class="mb-5"
              ></v-progress-linear>
              <v-form
                ref="contactForm"
                id="contact-form"
                @submit.prevent="updateAccount"
              >
                <v-text-field
                  v-model="formData.firstname"
                  label="First Name"
                  name="firstname"
                  type="text"
                  :rules="rules.required"
                />
                <v-text-field
                  v-model="formData.lastname"
                  label="Last Name"
                  name="lastname"
                  type="text"
                  :rules="rules.required"
                />
                <v-text-field
                  v-model="email"
                  :label="$t('account-activation.email')"
                  name="email"
                  type="text"
                  readonly
                />
                <v-text-field
                  v-model="formData.phone"
                  label="Phone Number"
                  name="phone"
                  type="text"
                  :rules="rules.phone"
                />
                <div class="d-flex justify-space-between align-center pt-2">
                  <v-btn
                    color="blue darken-1"
                    class="pl-0"
                    :disabled="loadingProfile"
                    text
                    @click="openChangePasswordDialog"
                  >
                    Change Password
                  </v-btn>
                  <v-btn
                    type="submit"
                    color="primary"
                    :disabled="loadingProfile"
                    :loading="loading"
                    form="contact-form"
                    >Update</v-btn
                  >
                </div>
              </v-form>
            </v-card-text>
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
    <change-password-dialog
      :open="changePasswordOpen"
      :loading="changePasswordLoading"
      @save="changePassword"
      @close="closeChangePasswordDialog"
    ></change-password-dialog>
  </v-content>
</template>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import { validationRules } from '@/helpers/validation'
import ChangePasswordDialog from './ChangePasswordDialog'
export default {
  components: {
    ChangePasswordDialog,
  },
  created: function () {
    this.loadingProfile = true
    API.get('/me/profile', {
      headers: AuthHelper.getAuthHeaders(),
    })
      .then((response) => {
        this.loadingProfile = false
        this.formData = {
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          phone: response.data.phone,
        }
        this.email = response.data.email
      })
      .catch(() => {
        this.loadingProfile = false
        this.snackbar = true
        this.snackbarText = 'Something went wrong'
        this.snackbarColor = 'red'
      })
  },
  data: () => ({
    formData: {
      firstname: '',
      lastname: '',
      phone: '',
    },
    email: '',
    loadingProfile: false,
    loading: false,
    changePasswordOpen: false,
    changePasswordLoading: false,
    rules: validationRules,
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),
  methods: {
    openChangePasswordDialog() {
      this.changePasswordOpen = true
    },
    closeChangePasswordDialog() {
      this.changePasswordOpen = false
    },
    changePassword(formData) {
      this.changePasswordLoading = true

      API.post(
        `/me/change-password`,
        {
          old_password: formData.oldPassword,
          new_password: formData.password,
        },
        {
          headers: AuthHelper.getAuthHeaders(),
        }
      )
        .then(({ data }) => {
          this.changePasswordOpen = false
          AuthHelper.updateToken(data.token)
          this.snackbar = true
          this.snackbarText = 'Password changed successfully'
          this.snackbarColor = 'green'
        })
        .catch(({ response }) => {
          this.snackbar = true
          this.snackbarText =
            response && response.data && response.data.message
              ? response.data.message
              : 'Something went wrong.'
          this.snackbarColor = 'red'
        })
        .finally(() => {
          this.changePasswordLoading = false
        })
    },
    updateAccount() {
      if (this.$refs.contactForm.validate()) {
        this.loading = true
        API.post('/me/profile', this.formData, {
          headers: AuthHelper.getAuthHeaders(),
        })
          .then((response) => {
            this.loading = false
            if (response.data && response.data.success) {
              this.snackbar = true
              this.snackbarText = 'Account Profile saved successfully'
              this.snackbarColor = 'green'
            } else {
              this.snackbar = true
              this.snackbarText = 'Account Profile saved failed'
              this.snackbarColor = 'red'
            }
          })
          .catch((error) => {
            this.loading = false
            console.log(error)
            this.snackbar = true
            this.snackbarText = 'Something went wrong.'
            this.snackbarColor = 'red'
          })
      }
    },
  },
}
</script>
