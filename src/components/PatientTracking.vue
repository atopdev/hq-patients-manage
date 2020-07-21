<template>
  <div>
    <table-view-component
      title="Patient Tracking"
      :expanded.sync="expanded"
      :single-expand="true"
      :show-expand="true"
      :headers="headers"
      :items="items"
      item-key="_id.$oid"
      :loading="loading"
      :options.sync="options"
      :totalCount="totalCount"
      @search="filterRecords"
      :filterFields="filterFields"
      :filterOptions="filterOptions"
      @filter="handleFilter"
    >
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-card class="ma-2" tile>
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Significant Contacts</v-toolbar-title>
              <v-spacer />
            </v-toolbar>
            <v-row v-if="item.contacts.length > 0">
              <v-col cols="6">
                <v-card
                  tile
                  v-for="(contact, index) in item.firstContacts"
                  :key="index"
                  class="ma-5"
                >
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon>mdi-account-circle-outline</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content class="text-left">
                      <v-list-item-title
                        >{{ contact.firstname }}
                        {{ contact.lastname }}</v-list-item-title
                      >
                      <v-list-item-subtitle>{{
                        contact.email
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action class="flex-row align-center">
                      <v-icon class="mr-5">mdi-phone</v-icon>{{ contact.phone }}
                    </v-list-item-action>
                  </v-list-item>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card
                  tile
                  v-for="(contact, index) in item.secondContacts"
                  :key="index"
                  class="ma-5"
                >
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon>mdi-account-circle-outline</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content class="text-left">
                      <v-list-item-title
                        >{{ contact.firstname }}
                        {{ contact.lastname }}</v-list-item-title
                      >
                      <v-list-item-subtitle>{{
                        contact.email
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action class="flex-row align-center">
                      <v-icon class="mr-5">mdi-phone</v-icon>{{ contact.phone }}
                    </v-list-item-action>
                  </v-list-item>
                </v-card>
              </v-col>
            </v-row>
            <v-row v-if="item.contacts.length == 0">
              <v-col>
                <v-alert outlined color="purple" class="mx-5">
                  <div>No significant contacts data entered</div>
                </v-alert>
              </v-col>
            </v-row>
          </v-card>
        </td>
      </template>
      <template v-slot:item.reportingDays="{ item }">{{
        item.response_dates.length || 'N/A'
      }}</template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" color="orange" @click="updateWorkstatus(item)">
              assignment
            </v-icon>
          </template>
          <span>Update workstatus</span>
        </v-tooltip>
      </template>
    </table-view-component>
    <EditPatientWorkstatusDialog
      :item="patientFormResponse"
      :updating="updating"
      v-model="editPatientWorkstatusDialog"
      @save="handleSave"
    ></EditPatientWorkstatusDialog>
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
  </div>
</template>

<style></style>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import { uniq } from 'lodash'
import EditPatientWorkstatusDialog from '@/components/EditPatientWorkstatusDialog'
import TableViewComponent from '@/components/TableViewComponent'

export default {
  components: {
    TableViewComponent,
    EditPatientWorkstatusDialog,
  },
  computed: {
    title() {
      return this.$route.meta.title
    },
  },
  data: () => ({
    loading: true,
    editPatientWorkstatusDialog: false,
    updating: false,
    expanded: [],
    search: '',
    items: [],
    options: {},
    patientFormResponse: {},
    filterFields: ['workstatus'],
    filterOptions: [
      [
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
    ],
    filterSelection: [
      [
        'cleared',
        'quarantine_exposure',
        'quarantine_igm_positive',
        'quarantine_covid19_positive',
        'stay_at_home',
      ],
    ],
    totalCount: 95,
    headers: [
      {
        text: 'Actions',
        value: 'actions',
        sortable: false,
        width: 50,
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
        text: 'Phone',
        value: 'phone',
        width: 120,
      },
      {
        text: 'Email',
        value: 'email',
        width: 120,
      },
      {
        text: 'Employer',
        value: 'employer_name',
        width: 100,
      },
      {
        text: 'IGG',
        value: 'igg',
        width: 50,
      },
      {
        text: 'IGM',
        value: 'igm',
        width: 50,
      },
      {
        text: 'Viral',
        value: 'covid',
        width: 50,
      },
      {
        text: 'Self Reporting Days',
        value: 'reportingDays',
        width: 50,
        sortable: false,
      },
      {
        text: 'Date of Last Test',
        value: 'date_of_last_test',
        width: 100,
      },
      {
        text: 'Workstatus',
        value: 'workstatus',
        width: 50,
      },
    ],
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),
  methods: {
    filterRecords(search) {
      this.search = search
      this.getData()
    },
    handleFilter(selections) {
      this.filterSelection = selections
      this.getData()
    },
    handleSave(data) {
      this.updating = true
      API.post(
        'patients/' + data.id + '/update-soap-workstatus',
        {
          workstatus: data.workstatus,
          encounter_id: data.last_encounter_id,
        },
        {
          headers: AuthHelper.getAuthHeaders(),
        }
      )
        .then(({ data: response }) => {
          if (response.success) {
            this.updating = false
            this.snackbarText = 'Workstatus was updated successfully'
            this.snackbarColor = 'success'
            this.snackbar = true
            this.editPatientWorkstatusDialog = false
            this.getData()
          }
        })
        .catch(() => {
          this.updating = false
          this.snackbarText = 'Could not update workstatus'
          this.snackbarColor = 'red'
          this.snackbar = true
        })
    },
    getData() {
      this.loading = true
      const dataFilters = this.filterFields.map((item, index) => ({
        field: item,
        value: this.filterSelection[index],
      }))
      API.get('/patients/tracking', {
        headers: AuthHelper.getAuthHeaders(),
        params: {
          search: this.search,
          sort_by: this.options.sortBy[0] || '',
          sort_dir: this.options.sortDesc[0] ? 'desc' : 'asc',
          page: this.options.page || 1,
          per_page: this.options.itemsPerPage || 10,
          filter: JSON.stringify(dataFilters),
        },
      }).then(({ data: response }) => {
        this.loading = false
        this.items = response.data.data.map((item) => {
          item.response_dates = uniq(item.response_dates)
          const half_length = Math.ceil(item.contacts.length / 2)
          item.firstContacts = item.contacts.slice(0, half_length)
          item.secondContacts = item.contacts.slice(
            half_length,
            item.contacts.length
          )
          return item
        })
        this.totalCount = response.data.pagination.total
      })
    },
    updateWorkstatus(item) {
      this.patientFormResponse = item
      this.editPatientWorkstatusDialog = true
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
