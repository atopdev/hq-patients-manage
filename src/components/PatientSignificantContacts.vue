<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" lg="7" sm="10" md="8">
            <v-card outlined class="elevation-12 form">
              <v-row class="logo">
                <v-img
                  :src="require('../assets/logo.png')"
                  contain
                  height="230"
                />
              </v-row>
              <v-spacer></v-spacer>
              <p class="text-center title mt-5">Significant Contacts</p>
              <p class="font-weight-bold" v-if="!saved">
                Please list any significant contacts that you may have had
                within the lats 48 hours, one per row. If you need to add
                additional contacts, please click the "add additional contact"
                button and a new line will appear for you to enter contact
                information. When you are finished adding all significant
                contacts, please click the "submit" button. Thank you for
                choosing HealthQuilt!
              </p>
              <p class="text-center title mt-5" v-if="saved">
                Thank you for submitting significant contacts.
              </p>
              <v-card-text v-if="!saved" class="pa-0">
                <v-form
                  ref="contactForm"
                  class="scroll-form"
                  id="contact-form"
                  @submit.prevent="saveContact"
                >
                  <v-row v-for="(item, index) in formData" :key="index">
                    <v-col cols="6" md="3">
                      <v-text-field
                        v-model="item.firstname"
                        label="First Name *"
                        name="firstname"
                        type="text"
                        :rules="rules.required"
                      />
                    </v-col>
                    <v-col cols="6" md="3">
                      <v-text-field
                        v-model="item.lastname"
                        label="Last Name *"
                        name="lastname"
                        type="text"
                        :rules="rules.required"
                      />
                    </v-col>
                    <v-col cols="4" md="2">
                      <v-text-field
                        v-model="item.phone"
                        label="Phone Number *"
                        name="phone"
                        type="text"
                        :rules="rules.phone"
                      />
                    </v-col>
                    <v-col cols="6" md="3">
                      <v-text-field
                        v-model="item.email"
                        label="Email"
                        name="email"
                        type="text"
                      />
                    </v-col>
                    <v-col cols="1" md="1" v-if="!item._id" class="pt-5">
                      <v-btn icon color="red" @click="deleteItem(index)">
                        <v-icon>
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions v-if="!saved" class="action-btn-block">
                <v-spacer />
                <v-btn color="warning" class="ma-3" @click="addContact"
                  >Add additional contact</v-btn
                >
                <v-btn
                  type="submit"
                  color="#6658dd"
                  dark
                  class="ma-3"
                  :loading="loading"
                  form="contact-form"
                  >Submit</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
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
    </v-content>
  </v-app>
</template>

<script>
import { validationRules } from '@/helpers/validation'
import { API } from '@/api'
export default {
  created: function () {
    if (this.$route.query.token == undefined) {
      this.$router.push('/')
    }
    API.get(
      '/valid-patient-token?token=' +
        this.$route.query.token +
        '&index=' +
        this.$route.query.index,
      {
        headers: {},
      }
    )
      .then(({ data: response }) => {
        if (response.contacts.length > 0) {
          this.formData = response.contacts
        }
      })
      .catch((error) => {
        console.log(error)
        this.snackbar = true
        this.snackbarText = 'Invalid Token'
        this.snackbarColor = 'red'
        setTimeout(() => {
          this.$router.push('/')
        }, 500)
      })
  },
  data: () => ({
    formData: [
      {
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
      },
    ],
    rules: validationRules,
    saved: false,
    loading: false,
    snackbar: false,
    snackbarText: '',
    snackbarColor: 'info',
    snackbarTimeout: 5000,
  }),
  methods: {
    saveContact() {
      const testIndex = this.$route.query.index
      if (this.$refs.contactForm.validate()) {
        this.loading = true
        const data = {
          token: this.$route.query.token,
          testIndex: testIndex,
          contacts: this.formData,
        }
        API.post('/significant-contacts', data, {
          headers: {},
        })
          .then(({ data: response }) => {
            this.loading = false
            if (response.success) {
              this.saved = true
              this.snackbar = true
              this.snackbarText = 'We got your response. Thank you!'
              this.snackbarColor = 'green'
              this.readyToLogin = true
              this.formData.map((item, index) => {
                if (!item._id) item._id = 'new_contact' + index
              })
            } else {
              this.saved = false
              this.snackbar = true
              this.snackbarText = 'Something went wrong!'
              this.snackbarColor = 'red'
            }
          })
          .catch((error) => {
            this.loading = false
            this.saved = false
            this.snackbar = true
            this.snackbarText =
              'There wes an error, please check the fields and submit again.'
            this.snackbarColor = 'red'
            console.log(error)
          })
      }
    },
    addContact() {
      this.formData.push({
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
      })
    },
    deleteItem(index) {
      this.formData.splice(index, 1)
    },
  },
}
</script>
<style scoped>
.container {
  background: #6658dd;
}
.form {
  padding: 80px;
  background: #ffffff url('../assets/bg-pattern.png');
  background-size: cover;
  background-repeat: no-repeat;
}
.scroll-form {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}
@media only screen and (max-width: 600px) {
  .form {
    padding: 20px !important;
  }
  .action-btn-block {
    flex-direction: column;
  }
  .action-btn-block button {
    width: 100%;
  }
}
</style>
