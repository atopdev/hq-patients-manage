<template>
  <v-content v-if="finishedLoading">
    <v-card>
      <v-card-title>
        {{ title }}
      </v-card-title>
      <v-card-text>
        <p class="title">{{ patient.firstname }} {{ patient.lastname }}</p>
        <v-list>
          <v-list-item
            ><span class="font-weight-bold mr-2">Phone:</span
            >{{ patient.phone }}</v-list-item
          >
          <v-list-item
            ><span class="font-weight-bold mr-2">Email:</span
            >{{ patient.email }}</v-list-item
          >
          <v-list-item v-if="patient.dob && patient.dob.$date"
            ><span class="font-weight-bold mr-2">Date of Birth:</span
            >{{ formatDate(patient.dob.$date) }}</v-list-item
          >
        </v-list>
      </v-card-text>
    </v-card>
    <v-card>
      <contactInformation v-if="user" user="user"></contactInformation>
    </v-card>
    <v-card>
      <v-card-text v-if="getAntibodyTests(patient.tests).length > 0">
        <p class="title">Antibody Test Results</p>
        <v-row>
          <v-col cols="1">
            <strong>Date</strong>
          </v-col>
          <v-col cols="1">
            <strong>IgG</strong>
          </v-col>
          <v-col cols="1">
            <strong>IgM</strong>
          </v-col>
          <v-col cols="2">
            <strong>Status</strong>
          </v-col>
          <v-col cols="2">
            <strong>Work Status</strong>
          </v-col>
          <v-col cols="4">
            <strong>Assessement and Plan</strong>
          </v-col>
        </v-row>
        <v-row
          v-for="(test, index) in getAntibodyTests(patient.tests)"
          :key="'abTest' + index"
        >
          <v-col cols="1">
            {{ formatTime(test.datetime.$date) }}
          </v-col>
          <v-col cols="1">
            {{ test.igg }}
          </v-col>
          <v-col cols="1">
            {{ test.igm }}
          </v-col>
          <v-col cols="2">
            {{
              test.status == 'verified'
                ? test.status + ' @ ' + formatTime(test.verified_datetime.$date)
                : test.status
            }}
          </v-col>
          <v-col cols="2">
            {{ getWorkStatus(patient.soaps, test.index) }}
          </v-col>
          <v-col cols="4">
            {{ formData.assessment }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-text v-if="getCovidTests(patient.tests).length > 0">
        <p class="title">Covid 19 Test Results</p>
        <v-row>
          <v-col cols="2">
            <strong>Date</strong>
          </v-col>
          <v-col cols="2">
            <strong>Result</strong>
          </v-col>
          <v-col cols="2">
            <strong>Status</strong>
          </v-col>
          <v-col cols="2">
            <strong>Work Status</strong>
          </v-col>
          <v-col cols="3">
            <strong>Assessement and Plan</strong>
          </v-col>
        </v-row>
        <v-row
          v-for="(test, index) in getCovidTests(patient.tests)"
          :key="'covidTest' + index"
        >
          <v-col cols="2">
            {{ formatTime(test.datetime.$date) }}
          </v-col>
          <v-col cols="2">
            {{ test.covid }}
          </v-col>
          <v-col cols="2">
            {{
              test.status == 'verified'
                ? test.status + ' @ ' + formatTime(test.verified_datetime.$date)
                : test.status
            }}
          </v-col>
          <v-col cols="2">
            {{ getWorkStatus(patient.soaps, test.index) }}
          </v-col>
          <v-col cols="3">
            {{ formData.assessment }}
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-content>
</template>

<script>
import ContactInformation from '@/components/ContactInformation'
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
export default {
  components: {
    contactInformation: ContactInformation,
  },
  created: function () {},
  data: () => ({
    finishedLoading: false,
    patient: {},
    user: {},
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
    this.fetchTests()
    this.fetchUserInfo()
  },

  methods: {
    fetchUserInfo() {
      const app = this
      API.get('user/patientportal', {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(function (response) {
          app.user = response.data[0]
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    fetchTests() {
      const app = this
      API.get('test/patientportal', {
        headers: AuthHelper.getAuthHeaders(),
      })
        .then(function (response) {
          app.patient = response.data[0]
          app.finishedLoading = true
          app.populateAPFields()
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
    getAntibodyTests(tests) {
      return tests.filter(function (test, index) {
        test['index'] = index
        return test.type == 'antibody'
      })
    },
    getCovidTests(tests) {
      return tests.filter(function (test, index) {
        test['index'] = index
        return test.type == 'covid19'
      })
    },
    populateAPFields() {
      let covidTest = null
      let abTest = null

      if (this.patient && this.patient.tests && this.patient.tests.length) {
        const antibodyTests = this.patient.tests.filter(
          (t) => t.type == 'antibody'
        )
        const covidTests = this.patient.tests.filter((t) => t.type == 'covid19')
        abTest = antibodyTests[antibodyTests.length - 1]
        covidTest = covidTests[covidTests.length - 1]
      }

      let assessment = ''
      if (
        abTest &&
        abTest.igm == 'Positive' &&
        abTest &&
        abTest.igg == 'Negative'
      ) {
        this.assessmentLabel =
          'IgM (+) & IgG (-) = Potentially Infected, Not Immune'
        assessment += 'IgM (+) & IgG (-) = Potentially Infected, Not Immune\n'
        assessment += 'Self-Quarantine until Covid-19 test negative\n'
        assessment += 'We will be scheduling a telemedicine visit\n'
        assessment +=
          'You will a receive a daily survey for temperature and symptoms\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (
        abTest &&
        abTest.igm == 'Negative' &&
        abTest &&
        abTest.igg == 'Negative'
      ) {
        this.assessmentLabel = 'IgM (-) & IgG (-) = Not Infected, Not Immune'
        assessment += 'IgM (-) & IgG (-) = Not Infected, Not Immune\n'
        assessment +=
          'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (
        abTest &&
        abTest.igm == 'Positive' &&
        abTest &&
        abTest.igg == 'Positive'
      ) {
        this.assessmentLabel =
          'IgM (+) & IgG (+) = Potentially Recent / current, Immune likely'
        assessment +=
          'IgM (+) & IgG (+) = Potentially Recent / current, Immune likely\n'
        assessment += 'Self-Quarantine until Covid-19 test negative\n'
        assessment += 'We will be scheduling a telemedicine visit\n'
        assessment +=
          'You will a receive a daily survey for temperature and symptoms\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (
        abTest &&
        abTest.igm == 'Negative' &&
        abTest &&
        abTest.igg == 'Positive'
      ) {
        this.assessmentLabel =
          'IgM (-) & IgG (+) = Not infected, Immune likely\n'
        assessment += 'IgM (-) & IgG (+) = Not infected, Immune likely'
        assessment +=
          'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (covidTest && covidTest.covid == 'Positive') {
        this.assessmentLabel = 'COVID-19 (+)'
        assessment += 'COVID-19 (+)'
        assessment += 'Self-Quarantine until Covid-19 test negative\n'
        assessment += 'We will be scheduling a telemedicine visit\n'
        assessment +=
          'You will a receive a daily survey for temperature and symptoms\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      } else if (covidTest && covidTest.covid == 'Negative') {
        this.assessmentLabel = 'COVID-19 (-)'
        assessment += 'COVID-19 (-)\n'
        assessment +=
          'If symptoms / temp 100.2, exposure Check Covid-19, then self-Quarantine until Covid-19 negative and no symptoms.\n'
        assessment +=
          'Continue to wash your hands, practice social distancing, wear a mask\n'
        this.formData.assessment = assessment
      }
    },
    getWorkStatus(soaps, testIndex) {
      let matchingSoaps = soaps.filter(
        (s) =>
          s['testIndex'] &&
          s['testIndex'].length &&
          s['testIndex'].includes(testIndex)
      )
      if (matchingSoaps.length) {
        const wsVal = matchingSoaps[matchingSoaps.length - 1].workstatus
        return this.workStatuses.find((s) => s.value == wsVal).label
      }
      return ''
    },
  },
}
</script>
