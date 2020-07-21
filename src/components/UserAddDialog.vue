<template>
  <v-dialog v-model="open" persistent max-width="500px">
    <v-card class="dialog-card">
      <v-card-title>
        <span class="headline">{{ user ? 'Edit User' : 'New User' }}</span>
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" class="user-form" ref="form" autocomplete="off">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="item.firstname"
                label="First Name *"
                :rules="rules.required"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="item.lastname"
                label="Last Name *"
                :rules="rules.required"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="item.email"
                :name="new Date().getTime().toString()"
                label="Email *"
                :rules="rules.email"
                autocomplete="off"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="item.password"
                :name="new Date().getTime().toString()"
                type="password"
                :label="user ? 'Password' : 'Password *'"
                autocomplete="off"
                :rules="user ? rules.password : rules.requiredPassword"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="item.phone"
                label="Phone *"
                :rules="rules.phone"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <api-autocomplete
                :api="fetchRoles"
                v-model="item.roles"
                item-text="name"
                item-value="id"
                label="Roles"
                multiple
                chips
              />
            </v-col>
            <v-col cols="12">
              <api-autocomplete
                :api="fetchClinics"
                v-model="item.clinics"
                item-text="name"
                item-value="id"
                label="Clinics"
                multiple
                chips
              />
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="item.active"
                label="Active"
                color="info"
              ></v-switch>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="save">Save</v-btn>
      </v-card-actions>

      <v-overlay :value="loading" absolute>
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-overlay>
    </v-card>
  </v-dialog>
</template>

<script>
import { API } from '@/api'
import { validationRules } from '@/helpers/validation'
import AuthHelper from '@/helpers/AuthHelper'

import ApiAutocomplete from '@/components/common/ApiAutocomplete'

export default {
  components: {
    ApiAutocomplete,
  },
  props: {
    open: {
      type: Boolean,
    },
    user: {
      type: Object,
    },
    loading: {
      type: Boolean,
    },
  },
  data() {
    return {
      item: {},
      valid: false,
      rules: validationRules,
      roleOptions: ['Admin', 'SuperAdmin', 'Stuff', 'User'],
      clinicOptions: ['Clinic A', 'Clinic B', 'Clinic C', 'Clinic D'],
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    save() {
      if (this.valid) {
        this.$emit('save', this.item)
      } else {
        this.$refs.form.validate()
      }
    },
    fetchRoles(inputVal) {
      return API.get('/filter-roles', {
        headers: AuthHelper.getAuthHeaders(),
        params: {
          search: inputVal,
        },
      }).then(({ data: response }) =>
        response.data.map((role) => ({
          id: role._id.$oid,
          name: role.label,
        }))
      )
    },
    fetchClinics(inputVal) {
      return API.get('/filter-clinics', {
        headers: AuthHelper.getAuthHeaders(),
        params: {
          search: inputVal,
        },
      }).then(({ data: response }) =>
        response.data.map((clinic) => ({
          id: clinic._id.$oid,
          name: clinic.name,
        }))
      )
    },
    resetForm() {
      if (this.user) {
        this.item = JSON.parse(JSON.stringify(this.user))
      } else if (this.$refs.form) {
        this.$refs.form.reset()
      }
    },
  },
  watch: {
    open(val) {
      if (val) {
        this.resetForm()
      }
    },
  },
}
</script>

<style>
.user-form .col-12 {
  padding-bottom: 0;
}
</style>

<style scoped>
.dialog-card {
  position: relative;
}
</style>
