<template>
  <v-dialog v-model="open" persistent max-width="500px">
    <v-card class="dialog-card">
      <v-card-title>
        <span class="headline">{{ $t('common.change-p') }}</span>
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" class="user-form" ref="form" autocomplete="off">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.oldPassword"
                type="password"
                :label="$t('common.old-p')"
                :rules="rules.required"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.password"
                type="password"
                :label="$t('common.password')"
                :rules="rules.requiredPassword"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.confirmPassword"
                type="password"
                :label="$t('common.confirm-p')"
                :rules="confirmPasswordRules"
              ></v-text-field>
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

export default {
  name: 'change-password-dialog',
  props: {
    open: {
      type: Boolean,
    },
    loading: {
      type: Boolean,
    },
  },
  data() {
    return {
      formData: {},
      valid: false,
      rules: validationRules,
    }
  },
  computed: {
    confirmPasswordRules() {
      return this.rules.confirmPassword(this.formData.password)
    },
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
        this.$emit('save', this.formData)
      } else {
        this.$refs.form.validate()
      }
    },
  },
}
</script>
