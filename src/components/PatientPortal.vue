<template>
  <v-content class="patient-portal" v-if="finishedLoading">
    <v-container class="bot-border">
      <v-img :src="require('../assets/logo.png')" contain height="120" />
    </v-container>
    <ContactInformation
      :patient="patient"
      :superadmin="isSuperadmin"
      @info-updated="handleUpdated"
    ></ContactInformation>
    <v-card class="text-left">
      <v-card-text v-if="antibodyTests.length > 0">
        <p class="title">{{ $t('patient-portal.head-antibodytest') }}</p>
        <v-row>
          <v-col cols="1">
            <strong>{{ $t('common.date') }}</strong>
          </v-col>
          <v-col cols="1">
            <strong>IgG</strong>
          </v-col>
          <v-col cols="1">
            <strong>IgM</strong>
          </v-col>
          <v-col cols="2">
            <strong>{{ $t('common.status') }}</strong>
          </v-col>
          <v-col cols="2">
            <strong>{{ $t('common.work-status') }}</strong>
          </v-col>
          <v-col cols="4">
            <strong>{{ $t('patient-portal.a-and-p') }}</strong>
          </v-col>
        </v-row>
        <v-row v-for="(test, index) in antibodyTests" :key="'abTest' + index">
          <v-col cols="1">
            {{ formatTime(test.created_datetime.$date) }}
          </v-col>
          <v-col cols="1">
            {{ test.igg }}
          </v-col>
          <v-col cols="1">
            {{ test.igm }}
          </v-col>
          <v-col cols="2">
            {{
              test.status == 'verified' && test.verified_datetime
                ? test.status + ' @ ' + formatTime(test.verified_datetime.$date)
                : test.status
            }}
          </v-col>
          <v-col cols="2">
            {{ test.workstatus }}
          </v-col>
          <v-col cols="4">
            {{ test.assessment }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="text-left">
      <v-card-text v-if="covidTests.length > 0">
        <p class="title">{{ $t('patient-portal.head-covidtest') }}</p>
        <v-row>
          <v-col cols="2">
            <strong>{{ $t('common.date') }}</strong>
          </v-col>
          <v-col cols="2">
            <strong>{{ $t('common.result') }}</strong>
          </v-col>
          <v-col cols="2">
            <strong>{{ $t('common.status') }}</strong>
          </v-col>
          <v-col cols="2">
            <strong>{{ $t('common.work-status') }}</strong>
          </v-col>
          <v-col cols="3">
            <strong>{{ $t('patient-portal.a-and-p') }} </strong>
          </v-col>
        </v-row>
        <v-row v-for="(test, index) in covidTests" :key="'covidTest' + index">
          <v-col cols="2">
            {{ formatTime(test.created_datetime.$date) }}
          </v-col>
          <v-col cols="2">
            {{ test.covid }}
          </v-col>
          <v-col cols="2">
            {{
              test.verified_datetime
                ? 'Verified @ ' + formatTime(test.verified_datetime.$date)
                : ''
            }}
          </v-col>
          <v-col cols="2">
            {{ test.workstatus }}
          </v-col>
          <v-col cols="4">
            <pre>{{ test.assessment }}</pre>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-content>
</template>

<style scoped>
.bot-border {
  border-bottom: 5px solid;
  margin-top: 4px;
}
.text-left {
  text-align: left !important;
}
.title {
  text-align: center !important;
}
pre {
  white-space: pre-wrap;
  font-family: Roboto;
}
</style>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import ContactInformation from '@/components/ContactInformation'
export default {
  components: {
    ContactInformation,
  },
  created: function () {
    this.isSuperadmin = AuthHelper.loggedIn().roles.indexOf('superadmin') >= 0
  },
  data: () => ({
    finishedLoading: false,
    isSuperadmin: false,
    patient: {},
    covidTests: [],
    antibodyTests: [],
    printMode: false,
    formData: {
      assessment: '',
    },
    workStatuses: [
      {
        label: 'Return to Work',
        value: 'cleared',
      },
      {
        label: 'Quarantine: Exposure',
        value: 'quarantine_exposure',
      },
      {
        label: 'Quarantine: IgM positive',
        value: 'quarantine_igm_positive',
      },
      {
        label: 'Quarantine: COVID-19 positive',
        value: 'quarantine_covid19_positive',
      },
      {
        label: 'Stay at home due to risk / illness',
        value: 'stay_at_home',
      },
    ],
  }),

  computed: {
    title() {
      return this.$route.meta.title
    },
  },

  mounted() {
    this.fetchUserInfo()
  },

  methods: {
    fetchUserInfo() {
      let url = 'user/patientportal'
      if (this.isSuperadmin) {
        if (this.$route.query.p) {
          localStorage.setItem('impersonated_patient_id', this.$route.query.p)
        }

        url += '?id=' + localStorage.getItem('impersonated_patient_id')
      }
      API.get(url, {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(({ data }) => {
          this.patient = data
          this.$i18n.locale = data.primaryLanguage
          this.finishedLoading = true
          this.populateAdditionalFields()
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString()
    },
    formatTime(dateStr) {
      if (dateStr)
        return (
          new Date(dateStr).toLocaleDateString() +
          ' ' +
          new Date(dateStr).toLocaleTimeString()
        )
    },
    populateAdditionalFields() {
      const tests = this.patient.tests || []
      if (tests.length) {
        const covidTests = []
        const antibodyTests = []

        tests.forEach((test) => {
          if (test.status !== 'verified') {
            return
          }

          let encounters = this.patient.encounters.filter(
            (encounter) => encounter._id.$oid === test.encounter_id.$oid
          )
          if (encounters.length) {
            const lastEncounter = encounters[encounters.length - 1]
            const wsVal = lastEncounter.workstatus
            test.workstatus = this.workStatuses.find(
              (s) => s.value == wsVal
            ).label
            test.assessment = lastEncounter.assessment
            const posArr = ['positive', 'pos', '+']
            const negArr = ['negative', 'neg', '-']
            if (
              test.type == 'antibody' &&
              posArr.indexOf(test.igm.toLowerCase()) >= 0
            ) {
              test.assessment +=
                'Please check your email for a secure web form to list any significant contacts that you have had in the last 48 hours.'
            } else if (test.type == 'covid19') {
              if (posArr.indexOf(test.covid.toLowerCase()) >= 0) {
                test.assessment +=
                  'Please check your email for a secure web form to list any significant contacts that you have had in the last 48 hours.'
              } else if (negArr.indexOf(test.covid.toLowerCase()) >= 0) {
                test.assessment +=
                  'Please inform your most recent significant contacts within the last 48 hours that your COVID19 test results are negative and that no further action is needed.'
              }
            }
          }

          if (test.type === 'covid19') {
            covidTests.push(test)
          } else if (test.type === 'antibody') {
            antibodyTests.push(test)
          } else {
            return
          }
        })

        this.covidTests = covidTests
        this.antibodyTests = antibodyTests
      }
    },
    handleUpdated(data) {
      this.patient = {
        ...this.patient,
        ...data,
      }
      this.$i18n.locale = data.primaryLanguage
    },
  },
}
</script>
