<template>
  <div>
    <table-view-component
      title="Employers"
      :headers="headers"
      :items="employers"
      :loading="loading"
      :options.sync="options"
      :totalCount="totalCount"
      @search="filterRecords"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-spacer></v-spacer>
          <v-dialog v-model="addEditDialog" max-width="500px">
            <template v-slot:activator="{ on }">
              <v-btn color="secondary" dark class="mb-2" v-on="on"
                >New Employer</v-btn
              >
            </template>

            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Company Name"
                        :rules="requiredFieldRules"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editedItem.phone"
                        label="Phone"
                        :rules="phoneRules"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="editedItem.email"
                        label="Email"
                        :rules="requiredEmailFieldRules"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="editedItem.timezone"
                        :items="['ET', 'CT', 'MT', 'PT', 'AKT']"
                        label="Timezone"
                        :rules="requiredFieldRules"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="save">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </table-view-component>
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

<style lang="scss">
.bot-border {
  border-bottom: 5px solid;
  margin-top: 4px;
}
</style>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'
import TableViewComponent from '@/components/TableViewComponent'
export default {
  components: {
    TableViewComponent,
  },
  data: () => ({
    addEditDialog: false,
    uploadDialog: false,
    options: {},
    totalCount: 0,
    loading: true,
    headers: [
      { text: 'Company Name', value: 'name', width: 200 },
      { text: 'Phone', value: 'phone', width: 150 },
      { text: 'email', value: 'email', with: 150 },
      { text: 'Timezone', value: 'timezone', width: 150 },
      { text: 'Actions', value: 'actions', sortable: false, width: 130 },
    ],
    employers: [],
    editedIndex: -1,
    editedItem: {
      id: '',
      name: '',
      phone: '',
      email: '',
      timezone: null,
    },
    defaultItem: {
      id: '',
      name: '',
      phone: '',
      email: '',
      timezone: null,
    },
    requiredFieldRules: [(v) => !!v || 'This is a required field'],
    requiredEmailFieldRules: [
      (v) => !!v || 'This is a required field',
      (v) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(v) || 'E-mail must be valid'
      },
    ],
    phoneRules: [
      (v) =>
        (!isNaN(parseInt(v)) && v.length == 10) ||
        'Phone number must be 10 digits no spaces or other charaters',
    ],
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),

  computed: {
    title() {
      return this.$route.meta.title
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New Employer' : 'Edit Employer'
    },
  },

  watch: {
    addEditDialog(val) {
      val || this.close()
    },
    options: {
      handler() {
        this.loading = true
        this.fetchItems()
      },
      deep: true,
    },
  },
  methods: {
    filterRecords(search) {
      this.search = search
      this.fetchItems()
    },
    fetchItems() {
      const app = this
      API.get('/employers', {
        headers: AuthHelper.getAuthHeaders(),
        params: {
          search: this.search,
          sort_by: this.options.sortBy[0] || '',
          sort_dir: this.options.sortDesc[0] ? 'desc' : 'asc',
          page: this.options.page || 1,
          per_page: this.options.itemsPerPage || 10,
        },
      })
        .then(({ data: response }) => {
          app.employers = response.data
          app.totalCount = response.total
          app.loading = false
        })
        .catch(function (error) {
          app.snackbarText = error
          app.snackbarColor = 'red'
          app.snackbar = true
        })
    },
    editItem(item) {
      this.editedIndex = this.employers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.addEditDialog = true
    },

    deleteItem(item) {
      const app = this
      const index = this.employers.indexOf(item)
      const r = confirm('Are you sure you want to delete this patient?')
      if (r == true) {
        const id = this.employers[index]['_id']['$oid']
        API.delete('employers', {
          headers: AuthHelper.getAuthHeaders(),
          data: { employer_id: id },
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Employer was deleted successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.employers.splice(index, 1)
              app.totalCount -= 1
            } else {
              app.snackbarText = 'Could not be deleted'
              app.snackbarColor = 'red'
              app.snackbar = true
            }
          })
          .catch(function (error) {
            app.snackbarText = error
            app.snackbarColor = 'red'
            app.snackbar = true
          })
      }
    },

    close() {
      this.addEditDialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save() {
      const app = this
      if (this.editedIndex > -1) {
        const { _id, ...data } = this.editedItem
        API.put(
          'employers',
          {
            ...data,
            employer_id: _id['$oid'],
          },
          {
            headers: AuthHelper.getAuthHeaders(),
          }
        )
          .then(function (response) {
            if (response.status == 200) {
              app.snackbarText = 'Employer was updated successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              // Object.assign(app.employers[app.editedIndex], app.editedItem)
            } else {
              app.snackbarText = 'Could not be updated'
              app.snackbarColor = 'red'
              app.snackbar = true
            }
          })
          .catch(function (error) {
            app.snackbarText = error
            app.snackbarColor = 'red'
            app.snackbar = true
          })
      } else {
        API.post('employers', this.editedItem, {
          headers: AuthHelper.getAuthHeaders(),
        })
          .then(function (response) {
            if (response.data.success) {
              app.snackbarText = 'Employer was added successfully'
              app.snackbarColor = 'success'
              app.snackbar = true
              app.addEditDialog = false
              app.fetchItems()
            } else {
              app.snackbarText = 'Could not be added'
              app.snackbarColor = 'red'
              app.snackbar = true
            }
          })
          .catch(function (error) {
            app.snackbarText = error
            app.snackbarColor = 'red'
            app.snackbar = true
          })
      }
    },
  },
}
</script>
