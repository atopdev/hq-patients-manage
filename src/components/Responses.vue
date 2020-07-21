<template>
  <table-view-component
    :title="title"
    :headers="headers"
    :items="items"
    :loading="loading"
    :options.sync="options"
    :totalCount="totalCount"
    @search="filterRecords"
  >
    <template v-slot:item.datetime="{ item }">
      {{ formatTime(item.datetime.$date) }}
    </template>
    <template v-slot:item.dob="{ item }">
      {{ formatDate(item.dob) }}
    </template>
    <template v-slot:item.age="{ item }">
      {{ calculateAge(item.dob) }}
    </template>
    <template v-slot:item.temp="{ item }">
      <p
        v-for="temp in listAllByDate(item, 'temp')"
        v-bind:key="temp + Math.random()"
        class="pb-0 mb-0"
      >
        {{ temp.date }}:
        <span
          v-bind:class="{
            'orange--text':
              parseFloat(temp.value).toFixed(2) > 103 &&
              parseFloat(temp.value).toFixed(2) < 104,
            'red--text': parseFloat(temp.value).toFixed(2) >= 104,
          }"
          >{{ parseFloat(temp.value).toFixed(2) }}&#176;</span
        >
      </p>
    </template>
    <template v-slot:item.travel="{ item }">
      <div v-if="item.locationContact">
        <p
          v-for="lcontact in listAllByDate(item, 'locationContact')"
          v-bind:key="lcontact + Math.random()"
          class="pb-0 mb-0"
        >
          {{ lcontact.date }}: {{ lcontact.value.join(', ') }}
        </p>
      </div>
      <div v-else>
        {{ item.travel ? 'Yes' : 'No' }}
      </div>
    </template>
    <template v-slot:item.contact="{ item }">
      {{ item.contact ? 'Yes' : 'No' }}
    </template>

    <template v-slot:item.symptoms="{ item }">
      <p
        v-for="symptom in listAllByDate(item, 'symptoms')"
        v-bind:key="symptom + Math.random()"
        class="pb-0 mb-0"
      >
        {{ symptom.date }}: {{ symptom.value.join(', ') }}
      </p>
    </template>

    <template v-slot:item.additionalSigns="{ item }">
      <p
        v-for="sign in listAllByDate(item, 'additionalSigns')"
        v-bind:key="sign + Math.random()"
        class="pb-0 mb-0"
      >
        {{ sign.date }}: {{ sign.value.join(', ') }}
      </p>
    </template>
  </table-view-component>
</template>

<style lang="scss">
.bot-border {
  border-bottom: 5px solid;
  margin-top: 4px;
}
</style>

<script>
import { API } from '@/api'
import TableViewComponent from '@/components/TableViewComponent'
import AuthHelper from '@/helpers/AuthHelper'
export default {
  components: {
    TableViewComponent,
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
  },
  data: () => ({
    loading: true,
    expanded: [],
    search: '',
    options: {},
    totalCount: 0,
    headers: [
      {
        text: 'Date/Time',
        value: 'datetime',
        width: 120,
      },
      {
        text: 'Phone',
        sortable: false,
        value: 'phone',
        width: 100,
      },
      {
        text: 'Email',
        value: 'email',
        width: 120,
      },
      {
        text: 'Employer',
        value: 'employer',
        width: 150,
      },
      {
        text: 'DoB',
        value: 'dob',
        width: 100,
      },
      {
        text: 'Age',
        sortable: false,
        value: 'age',
        width: 80,
      },
      {
        text: 'First Name',
        value: 'firstname',
        width: 120,
      },
      {
        text: 'Last Name',
        value: 'lastname',
        width: 120,
      },
      {
        text: 'Temperature',
        sortable: false,
        value: 'temp',
        width: 180,
      },
      {
        text: 'Traveled?',
        sortable: false,
        value: 'travel',
        width: 110,
      },
      {
        text: 'Contact?',
        sortable: false,
        value: 'contact',
        width: 100,
      },
      {
        text: 'Symptoms',
        sortable: false,
        value: 'symptoms',
        width: 450,
      },
      {
        text: 'Additional Symptoms',
        sortable: false,
        value: 'additionalSigns',
        width: 450,
      },
      {
        text: 'Medical Conditions',
        sortable: false,
        value: 'additionalSignsOther',
        width: 300,
      },
    ],
    items: [],
  }),
  methods: {
    filterRecords(search) {
      this.search = search
      this.getData()
    },
    getData() {
      this.loading = true
      API.get('/covid19', {
        headers: AuthHelper.getAuthHeaders(),
        params: {
          search: this.search,
          sort_by: this.options.sortBy[0] || '',
          sort_dir: this.options.sortDesc[0] ? 'desc' : 'asc',
          page: this.options.page || 1,
          per_page: this.options.itemsPerPage || 10,
        },
      }).then(({ data: response }) => {
        this.loading = false
        this.items = response.data.data
        this.totalCount = response.data.pagination.total
      })
    },
    formatTime(dateStr) {
      return (
        new Date(dateStr).toLocaleDateString() +
        ' ' +
        new Date(dateStr).toLocaleTimeString()
      )
    },
    formatDate(dateStr) {
      if (
        dateStr != '' &&
        (RegExp(/\d{2}\/\d{2}\/\d{4}/).test(dateStr) ||
          RegExp(/\d{4}-\d{2}-\d{2}/).test(dateStr))
      ) {
        if (!dateStr.includes('T')) {
          dateStr += 'T12:00:00'
        }
        return new Date(dateStr).toLocaleDateString()
      }
      return ''
    },
    calculateAge(dob) {
      if (
        dob != '' &&
        (RegExp(/\d{2}\/\d{2}\/\d{4}/).test(dob) ||
          RegExp(/\d{4}-\d{2}-\d{2}/).test(dob))
      ) {
        if (!dob.includes('T')) {
          dob += 'T12:00:00'
        }
        const birthday = new Date(dob)
        const ageDifMs = Date.now() - birthday.getTime()
        const ageDate = new Date(ageDifMs)
        return Math.abs(ageDate.getUTCFullYear() - 1970)
      }
      return ''
    },
    listAllByDate(item, key) {
      let items = [
        {
          date: new Date(item.datetime.$date).toLocaleDateString(),
          value: item[key],
        },
      ]
      for (var older of item.other) {
        if (older[key] !== undefined) {
          items.push({
            date: new Date(older.datetime.$date).toLocaleDateString(),
            value: older[key],
          })
        }
      }
      return items
    },
    tempColor(temp) {
      if (temp >= 103 && temp < 104) return 'orange'
      if (temp >= 104) return 'red'
      return ''
    },
  },
  watch: {
    options: {
      handler() {
        this.getData()
      },
      deep: true,
    },
  },
}
</script>
