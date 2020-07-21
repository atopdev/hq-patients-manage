<template>
  <div :class="pdf ? 'testing-report pdf' : 'testing-report'">
    <v-row class="logo" justify="start">
      <v-col cols="3" class="ma-6">
        <img
          :src="require('../../assets/logo.png')"
          style="object-fit: contain;"
          height="150"
        />
      </v-col>
    </v-row>
    <div v-if="data">
      <v-card-title class="green--text text-uppercase">
        {{ data.employer_name }} TESTING REPORT SUMMARY
      </v-card-title>
      <v-card-text class="testing-report">
        <v-row no-gutters>
          <v-col>
            <strong class="indigo--text">Date of testing</strong>
          </v-col>
          <v-col cols="4">
            <strong class="indigo--text">
              {{ data.date }}
            </strong>
          </v-col>
        </v-row>
        <v-row class="mt-3" no-gutters>
          <v-col>
            <strong class="indigo--text">
              Summary Status of Employees
            </strong>
          </v-col>
          <v-col>
            <strong class="indigo--text"></strong>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <strong class="grey--text">Cleared to work today:</strong>
          </v-col>
          <v-col>
            <strong class="grey--text">
              {{ data.cleared }}
            </strong>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <strong class="grey--text">Home quarantine</strong>
          </v-col>
          <v-col>
            <strong class="grey--text"></strong>
          </v-col>
        </v-row>
        <div class="pl-6">
          <v-row no-gutters>
            <v-col>
              <strong class="grey--text">COVID positive:</strong>
            </v-col>
            <v-col>
              <strong class="grey--text">
                {{ data.covid_positive }}
              </strong>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <strong class="grey--text">IgM positive:</strong>
            </v-col>
            <v-col>
              <strong class="grey--text">
                {{ data.igm_positive }}
              </strong>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <strong class="grey--text">Exposed:</strong>
            </v-col>
            <v-col>
              <strong class="grey--text">
                {{ data.exposed }}
              </strong>
            </v-col>
          </v-row>
        </div>
        <v-row no-gutters>
          <v-col>
            <strong class="grey--text">
              Not cleared to work due to risk or illness:
            </strong>
          </v-col>
          <v-col>
            <strong class="grey--text">
              {{ data.not_cleared }}
            </strong>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <strong class="grey--text">
              Total antibody tests:
            </strong>
          </v-col>
          <v-col>
            <strong class="grey--text">
              {{ data.antibody_total }}
            </strong>
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <strong class="grey--text">
              Total COVID tests:
            </strong>
          </v-col>
          <v-col>
            <strong class="grey--text">
              {{ data.covid_total }}
            </strong>
          </v-col>
        </v-row>
        <v-row class="mt-3" no-gutters>
          <v-col>
            <strong class="indigo--text">Test Results</strong>
          </v-col>
          <v-col>
            <strong class="indigo--text"></strong>
          </v-col>
        </v-row>
        <div class="mt-3" :key="i" v-for="(test, i) in data.tests">
          <v-row no-gutters>
            <v-col>
              <strong class="grey--text">Location:</strong>
            </v-col>
            <v-col>
              <strong class="grey--text">{{ test.name }}</strong>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <strong class="grey--text">
                Total surveyed, tested and verified:
              </strong>
            </v-col>
            <v-col>
              <strong class="grey--text">
                {{ test.verified }}
              </strong>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <strong class="grey--text">Results</strong>
            </v-col>
            <v-col>
              <strong class="grey--text"></strong>
            </v-col>
          </v-row>
          <div class="pl-6">
            <v-row no-gutters>
              <v-col>
                <strong class="grey--text">Antibody</strong>
              </v-col>
              <v-col>
                <strong class="grey--text"></strong>
              </v-col>
            </v-row>
            <div class="pl-6">
              <v-row no-gutters>
                <v-col>
                  <strong class="grey--text">IgM pos IgG pos:</strong>
                </v-col>
                <v-col>
                  <strong class="grey--text">
                    {{ test.igm_pos_igg_pos }}
                  </strong>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <strong class="grey--text">IgM pos IgG neg:</strong>
                </v-col>
                <v-col>
                  <strong class="grey--text">
                    {{ test.igm_pos_igg_neg }}
                  </strong>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <strong class="grey--text">IgM neg IgG pos:</strong>
                </v-col>
                <v-col>
                  <strong class="grey--text">
                    {{ test.igm_neg_igg_pos }}
                  </strong>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <strong class="grey--text">IgM neg IgG neg:</strong>
                </v-col>
                <v-col>
                  <strong class="grey--text">
                    {{ test.igm_neg_igg_neg }}
                  </strong>
                </v-col>
              </v-row>
            </div>
            <v-row no-gutters>
              <v-col>
                <strong class="grey--text">COVID</strong>
              </v-col>
              <v-col>
                <strong class="grey--text"></strong>
              </v-col>
            </v-row>
            <div class="pl-6">
              <v-row no-gutters>
                <v-col>
                  <strong class="grey--text">Negative:</strong>
                </v-col>
                <v-col>
                  <strong class="grey--text">
                    {{ test.covid_negative }}
                  </strong>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <strong class="grey--text">Pending:</strong>
                </v-col>
                <v-col>
                  <strong class="grey--text">
                    {{ test.covid_pending }}
                  </strong>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <v-col>
                  <strong class="grey--text">Indeterminate:</strong>
                </v-col>
                <v-col>
                  <strong class="grey--text">
                    {{ test.covid_indeterminate }}
                  </strong>
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </v-card-text>
    </div>
    <v-card-text v-if="!data">
      Testing report data was not loaded.
    </v-card-text>
  </div>
</template>
<script>
export default {
  name: 'TestReport',
  props: {
    data: {
      type: Object,
    },
    employer_name: {
      type: String,
    },
    date: {
      type: String,
    },
    pdf: {
      type: Boolean,
    },
  },
}
</script>

<style lang="scss">
.testing-report {
  &.pdf {
    background: #fff;
    padding-left: 30px;
    padding-right: 30px;
  }

  .row {
    .col:first-child {
      text-align: left !important;
    }
    .col:last-child {
      text-align: right !important;
    }
  }
}
</style>
