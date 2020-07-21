<template>
  <div>
    <v-card-title>
      <span class="headline">Make an appointment</span>
    </v-card-title>

    <v-card-text>
      <v-form v-model="valid" class="user-form" ref="form" autocomplete="off">
        <v-row>
          <v-col cols="6">
            <date-picker
              v-model="scheduledate"
              :rules="rules.required"
              :events="checkEvents"
              label="Choose a date"
              prepend-icon
            />
          </v-col>
          <v-col cols="12" v-if="schedules">
            <div class="section-header">
              <v-icon>event_available</v-icon>
              <span>Available slots</span>
            </div>
            <div class="timeslots section-value">
              <template v-for="slot in timeslots">
                <v-btn
                  :key="slot.key"
                  color="blue"
                  depressed
                  dark
                  v-if="selectedSlot === slot.key && !slot.disabled"
                >
                  {{ slot.label }}
                </v-btn>
                <v-btn
                  :key="slot.key"
                  color="primary"
                  outlined
                  v-if="selectedSlot !== slot.key && !slot.disabled"
                  @click="selectSlot(slot.key)"
                >
                  {{ slot.label }}
                </v-btn>
                <v-btn
                  :key="slot.key"
                  outlined
                  disabled
                  v-if="slot.past && !slot.scheduled"
                >
                  {{ slot.label }}
                </v-btn>
                <v-btn
                  :key="slot.key"
                  :class="
                    slot.name && !slot.past ? 'blue-disabled' : 'grey-disabled'
                  "
                  disabled
                  outlined
                  v-if="slot.scheduled"
                >
                  {{ slot.label }}
                </v-btn>
              </template>
              <div v-if="timeslots.length === 0">No slots available</div>
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
      <v-btn
        color="blue"
        :raised="!!selectedSlot"
        :dark="!!selectedSlot"
        @click="submit"
        :disabled="!selectedSlot"
      >
        Schedule
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script>
import { validationRules } from '@/helpers/validation'
import moment from 'moment-timezone'
import DatePicker from '@/components/DatePicker'
export default {
  name: 'PatientTelemedicineAdd',
  components: {
    DatePicker,
  },
  props: {
    timezone: {
      type: String,
      required: true,
    },
    schedules: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      valid: false,
      scheduledate: '',
      rules: validationRules,
      timeslots: [],
      selectedSlot: null,
    }
  },
  methods: {
    calcTimeslots() {
      if (!this.schedules || !this.scheduledate) {
        this.timeslots = []
        return
      }

      const slots = []

      let ts =
        moment
          .tz(this.scheduledate + ' 09:00:00', 'America/Chicago')
          .valueOf() / 1000

      const now = new Date().getTime() / 1000 + 600

      for (let i = 0; i < 72; i++) {
        const schedule = this.schedules.find(
          (schedule) => ts < schedule.end && schedule.start < ts + 600
        )
        if (schedule) {
          slots.push({
            key: ts,
            label: `${this.timeStr(ts)} - ${this.timeStr(ts + 600, true)}`,
            scheduled: true,
            past: ts < now,
            disabled: true,
            name: schedule.name || '',
          })
        } else {
          slots.push({
            key: ts,
            label: `${this.timeStr(ts)} - ${this.timeStr(ts + 600, true)}`,
            scheduled: false,
            past: ts < now,
            disabled: ts < now,
            name: '',
          })
        }

        ts += 600
      }
      this.timeslots = slots
      this.selectedSlot = null
    },
    timeStr(ts, showAmpm = false) {
      const format = showAmpm ? 'hh:mm a' : 'hh:mm'
      return moment.tz(ts * 1000, this.timezone).format(format)
    },
    selectSlot(key) {
      this.selectedSlot = key
    },
    checkEvents(date) {
      const ts = moment(date).unix()
      const today = moment('0', 'h').unix()

      return (
        ts >= today &&
        this.schedules &&
        this.schedules.some(
          (schedule) => schedule.start > ts && schedule.end < ts + 86400
        )
      )
    },
    close() {
      this.$emit('close')
    },
    submit() {
      this.$emit('submit', this.selectedSlot)
    },
  },
  watch: {
    scheduledate() {
      this.$nextTick(() => {
        this.calcTimeslots()
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.scheduledate = null
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

  @media only screen and (max-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media only screen and (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media only screen and (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media only screen and (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
  }
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
