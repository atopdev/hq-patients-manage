<template>
  <v-dialog v-model="open" persistent max-width="500px">
    <v-card class="dialog-card">
      <v-card-title>
        <span class="headline">{{ $t('patient-portal.patient-info') }}</span>
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" class="user-form" ref="form" autocomplete="off">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.firstname"
                :label="$t('common.firstname')"
                :rules="rules.required"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.lastname"
                :label="$t('common.lastname')"
                :rules="rules.required"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <date-picker
                v-model="formData.dob"
                append-icon
                :rules="rules.required"
                :label="$t('common.dob')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.primaryLanguage"
                :items="languageOptions"
                :label="$t('common.language')"
                item-value="value"
                item-text="text"
                :rules="rules.required"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.phone"
                :label="$t('common.phone')"
                :rules="rules.phone"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.timezone"
                :items="['ET', 'CT', 'MT', 'PT', 'AKT']"
                :label="$t('common.timezone')"
                :rules="rules.required"
              ></v-select>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">{{
          $t('common.cancel')
        }}</v-btn>
        <v-btn color="blue darken-1" text @click="save">{{
          $t('common.save')
        }}</v-btn>
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
import { validationRules } from '@/helpers/validation'
import DatePicker from '@/components/DatePicker'
export default {
  name: 'patient-info-dialog',
  components: {
    DatePicker,
  },
  props: {
    open: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
    info: {
      type: Object,
    },
  },
  data() {
    return {
      formData: {},
      dobTime: '',
      valid: false,
      rules: validationRules,
      languageOptions: [
        { text: 'English', value: 'en' },
        { text: 'Español', value: 'es' },
      ],
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    save() {
      if (
        this.valid &&
        this.formData.password === this.formData.confirmPassword
      ) {
        this.$emit('save', {
          firstname: this.formData.firstname,
          lastname: this.formData.lastname,
          dob: this.formData.dob,
          dobTime: this.formData.dobTime,
          primaryLanguage: this.formData.primaryLanguage,
          phone: this.formData.phone,
          timezone: this.formData.timezone,
        })
      } else {
        this.$refs.form.validate()
      }
    },
    resetForm() {
      if (this.info) {
        this.formData = JSON.parse(JSON.stringify(this.info))
        const isoDobStr = new Date(this.formData.dob.$date).toISOString()
        this.formData.dob = isoDobStr.substr(0, 10)
        this.formData.dobTime = isoDobStr.substr(11)
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
