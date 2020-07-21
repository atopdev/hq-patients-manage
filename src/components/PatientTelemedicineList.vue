<template>
  <div>
    <v-card-title>
      <span class="headline">My Telemedicine Appointments</span>
    </v-card-title>

    <v-card-text>
      <div v-if="schedules && schedules.length > 0">
        <v-row>
          <v-col :key="schedule.start" cols="12" v-for="schedule in schedules">
            <span class="time">{{ timeStr(schedule) }}</span>
            <v-btn class="mr-1" color="blue" text @click="openLink(schedule)"
              >Join</v-btn
            >
            <v-btn color="red" text @click="openCancelDialog(schedule)"
              >Cancel</v-btn
            >
          </v-col>
        </v-row>
      </div>
      <div v-if="!schedules || schedules.length === 0">
        You don't have any appointments.
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn class="add-button" color="blue" raised dark @click="add"
        >Add</v-btn
      >
    </v-card-actions>

    <v-dialog v-model="dialog" max-width="320">
      <v-card>
        <v-card-title class="headline">Cancel appointment</v-card-title>

        <v-card-text>
          Do you want to cancel the appointment?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text @click="dialog = false">
            No
          </v-btn>

          <v-btn color="blue" text @click="cancelEvent">
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment-timezone'

export default {
  name: 'PatientTelemedicineList',
  props: {
    schedules: {
      type: Array,
    },
    timezone: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      selectedEvent: '',
    }
  },
  methods: {
    add() {
      this.$emit('add')
    },
    timeStr(schedule) {
      const str1 = moment
        .tz(schedule.start * 1000, this.timezone)
        .format('MM/DD/YYYY -- h:mm')
      const str2 = moment.tz(schedule.end * 1000, this.timezone).format('h:mma')
      return `${str1} - ${str2}`
    },
    openLink(schedule) {
      window.open(schedule.link, '_blank')
    },
    openCancelDialog(schedule) {
      this.selectedEvent = schedule.id
      this.dialog = true
    },
    cancelEvent() {
      this.dialog = false
      this.$emit('cancel', this.selectedEvent)
    },
  },
}
</script>

<style scoped>
.time {
  display: inline-block;
  width: 260px;
  font-size: 16px;
  font-weight: 500;
}
.v-cart-title {
  margin-bottom: 20px;
}
.v-btn.add-button {
  min-width: 100px;
}
</style>
