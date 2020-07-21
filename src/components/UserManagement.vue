<template>
  <table-view-component
    title="User Management"
    :headers="headers"
    :items="items"
    :loading="loading"
    :options.sync="options"
    :totalCount="totalCount"
    @search="filterRecords"
  >
    <template v-slot:item.roles="{ item }">{{
      item.roles.map((r) => r.label).join(', ')
    }}</template>
    <template v-slot:item.clinics="{ item }">{{
      item.clinics.map((c) => c.name).join(', ')
    }}</template>
    <template v-slot:item.actions="{ item }">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon
            v-on="on"
            color="orange"
            class="mr-2"
            @click="openEditDialog(item)"
            >mdi-pencil</v-icon
          >
        </template>
        <span>Edit</span>
      </v-tooltip>

      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" @click="deleteUser(item)">mdi-delete</v-icon>
        </template>
        <span>Delete</span>
      </v-tooltip>

      <v-tooltip top v-if="isPatient(item)">
        <template v-slot:activator="{ on }">
          <v-icon
            v-on="on"
            color="green"
            class="mr-2"
            @click="impersonatePatient(item)"
            >mdi-login</v-icon
          >
        </template>
        <span>Impersonate</span>
      </v-tooltip>
    </template>
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-spacer></v-spacer>
        <v-btn color="secondary" dark class="mb-2" @click="openCreateDialog()"
          >New User</v-btn
        >
        <user-add-dialog
          ref="dialog"
          :open="dialogOpen"
          :loading="dialogLoading"
          :user="selectedUser"
          @close="closeDialog"
          @save="handleSave"
        ></user-add-dialog>
      </v-toolbar>
    </template>
  </table-view-component>
</template>

<style></style>

<script>
import { API } from '@/api'
import AuthHelper from '@/helpers/AuthHelper'

import TableViewComponent from '@/components/TableViewComponent'
import UserAddDialog from '@/components/UserAddDialog'

export default {
  components: {
    TableViewComponent,
    UserAddDialog,
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
    items: [],
    options: {},
    totalCount: 95,
    headers: [
      {
        text: 'Actions',
        value: 'actions',
        width: 50,
      },
      {
        text: 'Email',
        value: 'email',
        width: 120,
      },
      {
        text: 'First Name',
        value: 'firstname',
        width: 150,
      },
      {
        text: 'Last Name',
        value: 'lastname',
        width: 150,
      },
      {
        text: 'Roles',
        value: 'roles',
        width: 100,
      },
      {
        text: 'Clinics',
        value: 'clinics',
        width: 80,
      },
    ],
    selectedUser: null,
    dialogOpen: false,
    dialogLoading: false,
  }),
  methods: {
    filterRecords(search) {
      this.search = search
      this.getData()
    },
    getData() {
      this.loading = true
      API.get('/users', {
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
    openCreateDialog() {
      this.selectedUser = null
      this.dialogOpen = true
    },
    openEditDialog(item) {
      this.selectedUser = {
        id: item._id.$oid,
        firstname: item.firstname,
        lastname: item.lastname,
        email: item.email,
        phone: item.phone,
        active: item.active,
        roles: item.roles.map((r) => ({
          id: r._id.$oid,
          name: r.label,
        })),
        clinics: item.clinics.map((c) => ({
          id: c._id.$oid,
          name: c.name,
        })),
      }
      this.dialogOpen = true
    },
    handleSave(data) {
      if (this.selectedUser) {
        this.editUser(data)
      } else {
        this.createUser(data)
      }
    },
    createUser(data) {
      this.dialogLoading = true
      API.post(
        `/users`,
        {
          ...data,
          clinics: data.clinics ? data.clinics.map((c) => c.id) : [],
          roles: data.roles ? data.roles.map((r) => r.id) : [],
        },
        {
          headers: AuthHelper.getAuthHeaders(),
        }
      )
        .then(() => {
          this.dialogLoading = false
          this.dialogOpen = false
          this.getData()
        })
        .catch((err) => {
          this.dialogLoading = false

          if (err.response && err.response.status === 409) {
            alert('User already exists')
          } else {
            alert('Server side error')
          }
        })
    },
    editUser(data) {
      const { id, password, ...payload } = data

      this.dialogLoading = true
      API.put(
        `/users/${id}`,
        {
          ...payload,
          clinics: payload.clinics ? payload.clinics.map((c) => c.id) : [],
          roles: payload.roles ? payload.roles.map((r) => r.id) : [],
          password: password || undefined,
        },
        {
          headers: AuthHelper.getAuthHeaders(),
        }
      )
        .then(() => {
          this.dialogOpen = false
          this.dialogLoading = false
          this.getData()
        })
        .catch((err) => {
          this.dialogLoading = false
          console.dir(err)

          if (err.response && err.response.status === 400) {
            alert('Invalid request. Please check your form again')
          } else {
            alert('Server side error')
          }
        })
    },
    deleteUser(item) {
      const r = confirm('Are you sure you want to delete this user?')
      if (r) {
        this.loading = true
        API.delete(`/users/${item._id.$oid}`, {
          headers: AuthHelper.getAuthHeaders(),
        })
          .then(() => {
            this.getData()
          })
          .catch(() => {
            this.loading = false
            alert('Server side error')
          })
      }
    },
    isPatient(item) {
      return item.roles.filter((r) => r.name == 'patient').length > 0
    },
    impersonatePatient(item) {
      let routeData = this.$router.resolve({
        name: 'portal',
        query: { p: item._id.$oid },
      })
      window.open(routeData.href, '_blank')
    },
    closeDialog() {
      this.dialogOpen = false
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
