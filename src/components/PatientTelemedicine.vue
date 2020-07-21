<template>
  <v-content class="patient-telemedicine">
    <v-container class="bot-border">
      <v-img :src="require('../assets/logo.png')" contain height="120" />
    </v-container>
    <v-card class="layout-card">
      <patient-telemedicine-list
        :timezone="timezone"
        :schedules="myAppointments"
        @add="addNewAppointment"
        @cancel="cancelEvent"
        v-if="view === 1"
      ></patient-telemedicine-list>
      <patient-telemedicine-add
        :timezone="timezone"
        :schedules="schedules"
        @close="showMyAppointments"
        @submit="scheduleEvent"
        v-if="view === 2"
      ></patient-telemedicine-add>

      <v-overlay :value="loading" absolute>
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-overlay>
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
  </v-content>
</template>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import { timezones } from '@/helpers/utils'
import moment from 'moment-timezone'
import { sortBy } from 'lodash'
import PatientTelemedicineAdd from './PatientTelemedicineAdd'
import PatientTelemedicineList from './PatientTelemedicineList'

export default {
  name: 'PatientTelemedicine',
  components: {
    PatientTelemedicineAdd,
    PatientTelemedicineList,
  },
  data() {
    return {
      patient: null,
      loading: false,
      schedules: [],
      view: 1,
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'info',
      snackbarTimeout: 5000,
    }
  },
  computed: {
    timezone() {
      const tz = this.patient ? this.patient.timezone : 'CT'
      return timezones[tz]
    },
    myAppointments() {
      const now = new Date().getTime() / 1000
      let filtered = this.schedules
        ? this.schedules.filter(
            (schedule) => schedule.name && schedule.start > now
          )
        : []

      return sortBy(filtered, 'start')
    },
  },
  methods: {
    getSchedules() {
      this.loading = true
      API.get(
        `/schedule_telemedicine/clinic_schedule?clinic=contactus@healthquilt.com&patient=${encodeURIComponent(
          this.patient.email
        )}`,
        {
          headers: AuthHelper.getAuthHeaders(),
        }
      )
        .then(({ data }) => {
          this.schedules = data
        })
        .catch(() => {
          this.schedules = null
        })
        .finally(() => {
          this.loading = false
        })
    },
    addNewAppointment() {
      this.view = 2
    },
    showMyAppointments() {
      this.view = 1
    },
    scheduleEvent(ts) {
      const start_datetime = new Date(ts * 1000).toISOString()
      const end_datetime = new Date(ts * 1000 + 600000).toISOString()
      this.loading = true
      API.post(
        '/schedule_telemedicine/patient',
        {
          patient_id: this.patient._id.$oid,
          clinic: 'contactus@healthquilt.com',
          start_datetime,
          end_datetime,
        },
        {
          headers: AuthHelper.getAuthHeaders(),
        }
      )
        .then(({ data }) => {
          if (data.success) {
            this.snackbarText = 'Telemedicine call was scheduled successfully'
            this.snackbarColor = 'success'
            this.snackbar = true
            this.schedules.push({
              id: data.eventId,
              link: data.link,
              name: `${this.patient.firstname} ${this.patient.lastname}`,
              start: ts,
              end: ts + 600,
            })
            this.view = 1
          } else {
            throw new Error('Could not schedule the call')
          }
        })
        .catch((error) => {
          this.snackbarText = error
          this.snackbarColor = 'red'
          this.snackbar = true
        })
        .finally(() => {
          this.loading = false
        })
    },
    fetchUserInfo() {
      let url = 'user/patientportal'
      if (this.isSuperadmin) {
        url += '?id=' + this.$route.query.p
      }
      this.loading = true
      API.get(url, {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(({ data }) => {
          this.patient = data
          this.$i18n.locale = data.primaryLanguage
          this.getSchedules()
        })
        .catch(() => {
          this.loading = false
        })
    },
    cancelEvent(eventId) {
      this.loading = true
      API.post(
        '/schedule_telemedicine/cancel',
        {
          event: eventId,
        },
        {
          headers: AuthHelper.getAuthHeaders(),
        }
      )
        .then(({ data }) => {
          if (data.success) {
            this.snackbarText = 'Telemedicine call was cancelled successfully'
            this.snackbarColor = 'success'
            this.snackbar = true
            this.schedules = this.schedules.filter((s) => s.id !== eventId)
          } else {
            throw new Error('Could not schedule the call')
          }
        })
        .catch((error) => {
          this.snackbarText = error
          this.snackbarColor = 'red'
          this.snackbar = true
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
  watch: {
    scheduledate() {
      this.$nextTick(() => {
        this.calcTimeslots()
      })
    },
    dialog(val) {
      if (val) {
        this.selectedSlot = null
        this.scheduledate = moment().format('YYYY-MM-DD')
        this.$nextTick(() => {
          this.calcTimeslots()
        })
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchUserInfo()
    })
  },
}
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  align-items: center;

  .v-icon {
    margin-right: 8px;
  }
}
.section-value {
  margin-left: 32px;
  margin-top: 12px;
}
.timeslots {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 16px;
  white-space: nowrap;
}
.timezone {
  font-size: 16px;
  font-weight: 500;
}
.layout-card {
  padding: 40px 20px 20px;
}
.v-card__actions {
  padding: 16px;
}
.blue-disabled.blue-disabled {
  background-color: #2196f3 !important;
  border-color: #2196f3 !important;
  color: white !important;
  opacity: 0.6;
}
.grey-disabled.grey-disabled {
  background-color: #a9a9a9 !important;
  border-color: #a9a9a9 !important;
  color: white !important;
  opacity: 0.6;
}
</style>
