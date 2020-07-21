<template>
  <v-menu
    v-model="dateMenu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :label="label"
        readonly
        :solo="solo"
        :value="dateDisp"
        v-on="on"
        :append-icon="appendIcon ? 'event' : ''"
        :prepend-icon="prependIcon ? 'event' : ''"
        :rules="rules"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="date"
      @input="dateMenu = false"
      ref="picker"
      locale="en-us"
      no-title
      :events="events"
    ></v-date-picker>
  </v-menu>
</template>
<script>
export default {
  name: 'DatePicker',
  props: {
    label: {
      type: String,
      default: 'Date',
    },
    value: {
      type: [String, Object],
    },
    rules: {
      type: Array,
      default: () => [],
    },
    appendIcon: {
      type: Boolean,
      default: false,
    },
    prependIcon: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    events: {
      type: Function,
      default: () => {},
    },
  },
  computed: {
    dateDisp() {
      return this.formatDate(this.date)
    },
  },
  data() {
    return {
      dateMenu: false,
      date: this.value ? this.value.substr(0, 10) : '',
    }
  },
  watch: {
    date(val) {
      const newVal = val ? val.substr(0, 10) : ''
      this.$emit('input', newVal)
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
  },
}
</script>
