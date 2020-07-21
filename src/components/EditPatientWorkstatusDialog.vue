<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">Change Workstatus</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-form
            id="form"
            v-model="valid"
            ref="workstatusForm"
            autocomplete="off"
          >
            <v-row>
              <v-col cols="12">
                <v-radio-group
                  v-model="formData.workstatus"
                  :rules="requiredYesNoFieldRules"
                  :required="true"
                  :mandatory="true"
                >
                  <v-radio
                    v-for="(item, index) in workStatuses"
                    :key="'workStatus' + index"
                    :items="workStatuses"
                    :label="item.label"
                    :value="item.value"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">Close</v-btn>
        <v-btn color="warning" @click="save">Update</v-btn>
      </v-card-actions>
      <v-overlay :value="updating" absolute>
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
// import { API } from '@/api'
// import AuthHelper from '@/helpers/AuthHelper'
export default {
  name: 'EditPatientWorkstatusDialog',
  data: () => ({
    valid: false,
    formData: {
      workstatus: null,
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
    requiredYesNoFieldRules: [(v) => v !== null || 'Please select one'],
  }),
  computed: {
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
  },
  watch: {
    show(val) {
      if (val == false) {
        setTimeout(() => {
          this.$refs.workstatusForm.reset()
        }, 300)
      } else {
        this.populateFields()
      }
    },
  },
  methods: {
    populateFields() {
      if (this.item) {
        this.formData.workstatus = this.item.workstatus
      }
    },
    save() {
      const saveData = {
        id: this.item._id.$oid,
        workstatus: this.formData.workstatus,
        last_encounter_id: this.item.last_encounter_id,
      }
      this.$emit('save', saveData)
    },
    close() {
      this.show = false
    },
  },
  props: {
    value: Boolean,
    updating: Boolean,
    item: {
      type: Object,
    },
  },
}
</script>
