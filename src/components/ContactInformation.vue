<template v-slot:top>
  <v-card id="contactInformation">
    <v-content>
      <div class="text-center" v-if="!printMode">
        <v-btn @click="print" color="warning" class="ma-2" dark>{{
          $t('common.print')
        }}</v-btn>
        <v-btn
          @click="downloadPDF"
          color="warning"
          class="ma-2"
          dark
          :loading="downloading"
        >
          {{ $t('common.downloadPDF') }}
        </v-btn>
      </div>

      <v-container>
        <v-card-title class="headline">
          {{ $t('patient-portal.head-contactinfo') }}
        </v-card-title>

        <v-card-text>
          <v-row style="text-align: left;">
            <v-col cols="12">
              {{ $t('common.fullname') }}: {{ patient.firstname }}
              {{ patient.lastname }}
            </v-col>
            <v-col cols="12">
              {{ $t('common.dob') }}: {{ formatDate(patient.dob.$date) }}
            </v-col>
            <v-col cols="12">
              {{ $t('common.phone') }}: {{ patient.phone }}
            </v-col>
            <v-col cols="12">
              {{ $t('common.email') }}: {{ patient.email }}
            </v-col>
          </v-row>
        </v-card-text>

        <template>
          <v-row>
            <v-btn color="blue darken-1" text @click="openChangePasswordDialog">
              {{ $t('common.change-p') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="openEditDialog">
              {{ $t('common.edit') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              :loading="confirming"
              @click="confirm"
            >
              {{ $t('common.confirm') }}
            </v-btn>
          </v-row>
        </template>
      </v-container>
    </v-content>
    <change-password-dialog
      :open="changePasswordOpen"
      :loading="changePasswordLoading"
      @save="changePassword"
      @close="closeChangePasswordDialog"
    ></change-password-dialog>
    <patient-info-dialog
      :open="editDialogOpen"
      :loading="editDialogLoading"
      :info="patient"
      @save="updateInfo"
      @close="closeEditDialog"
    ></patient-info-dialog>

    <v-snackbar v-model="snackbar" bottom color="red" :timeout="5000">
      {{ snackbarText }}
      <v-btn dark text @click="snackbar = false">
        {{ $t('common.dismiss') }}
      </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import { saveAs } from 'file-saver'

import ChangePasswordDialog from './ChangePasswordDialog'
import PatientInfoDialog from './PatientInfoDialog'

export default {
  name: 'contactInformation',
  components: {
    ChangePasswordDialog,
    PatientInfoDialog,
  },
  props: {
    patient: {},
    superadmin: null,
  },
  data: () => ({
    printMode: false,
    changePasswordOpen: false,
    changePasswordLoading: false,
    editDialogOpen: false,
    editDialogLoading: false,
    confirming: false,
    snackbar: false,
    snackbarText: '',
    downloading: false,
  }),
  methods: {
    print() {
      this.printMode = true
      var self = this
      setTimeout(() => {
        window.print()
        self.printMode = false
      }, 100)
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
    downloadPDF() {
      this.downloading = true
      let url = '/test/patientportal/pdf'
      if (this.superadmin) {
        url += '?id=' + this.$route.query.p
      }
      API.get(url, {
        headers: AuthHelper.getAuthHeaders(),
        params: { date: this.date },
        responseType: 'blob',
      })
        .then(({ data }) => {
          saveAs(
            new Blob([data], { type: 'text/plain;charset=utf-8' }),
            'patient-info.pdf'
          )
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          this.downloading = false
        })
    },
    openChangePasswordDialog() {
      this.changePasswordOpen = true
    },
    closeChangePasswordDialog() {
      this.changePasswordOpen = false
    },
    changePassword(formData) {
      this.changePasswordLoading = true
      let url = '/me/change-password'
      if (this.superadmin) {
        url = '/impersonation/change-password?id=' + this.$route.query.p
      }
      API.post(
        url,
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
          if (!this.superadmin) {
            AuthHelper.updateToken(data.token)
          }
        })
        .catch(({ response }) => {
          this.snackbar = true
          this.snackbarText =
            response && response.data && response.data.message
              ? response.data.message
              : this.$t('common.s-wrong')
        })
        .finally(() => {
          this.changePasswordLoading = false
        })
    },
    openEditDialog() {
      this.editDialogOpen = true
    },
    closeEditDialog() {
      this.editDialogOpen = false
    },
    updateInfo(formData) {
      this.editDialogLoading = true
      let url = '/me/profile'
      if (this.superadmin) {
        url = '/impersonation/profile?id=' + this.$route.query.p
      }
      const dob = formData.dob + 'T' + formData.dobTime
      delete formData.dobTime
      API.post(url, formData, {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(() => {
          this.editDialogOpen = false
          formData.dob = { $date: new Date(dob).getTime() }
          this.$emit('info-updated', formData)
        })
        .catch(() => {
          this.snackbar = true
          this.snackbarText = this.$t('common.s-wrong')
        })
        .finally(() => {
          this.editDialogLoading = false
        })
    },
    confirm() {
      this.confirming = true
      let url = '/me/profile/confirm'
      if (this.superadmin) {
        url = '/impersonation/profile/confirm?id=' + this.$route.query.p
      }
      API.post(url, null, {
        headers: AuthHelper.getAuthHeaders(),
      })
        .catch(() => {
          this.snackbar = true
          this.snackbarText = this.$t('common.s-wrong')
        })
        .finally(() => {
          this.confirming = false
        })
    },
  },
}
</script>
