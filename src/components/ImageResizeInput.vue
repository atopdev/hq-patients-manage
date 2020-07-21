<template>
  <image-uploader
    :debug="1"
    :maxWidth="800"
    :maxHeight="600"
    :quality="0.7"
    outputFormat="verbose"
    :preview="false"
    :className="['fileinput']"
    :capture="false"
    accept="image/*"
    doNotResize="['gif', 'svg']"
    @input="setImage"
  >
    <label for="fileInput" slot="upload-label">
      <div
        class="v-input theme--light v-text-field v-text-field--is-booted v-file-input"
      >
        <div class="v-input__prepend-outer">
          <div class="v-input__icon v-input__icon--prepend">
            <span
              aria-label="prepend icon"
              class="v-icon notranslate v-icon--link mdi mdi-paperclip theme--light"
            ></span>
          </div>
        </div>
        <div class="v-input__control">
          <div class="v-input__slot">
            <div class="v-text-field__slot">
              <span
                class="v-label theme--light"
                style="left: 0px; right: auto; position: absolute;"
                v-bind:class="{ 'v-label--active': filename }"
                >Image</span
              >
              <div
                v-if="filename"
                class="v-file-input__text v-file-input__text--chips"
              >
                <v-chip>
                  {{ filename }}
                </v-chip>
              </div>
            </div>
            <div class="v-input__append-inner" v-if="filename">
              <div class="v-input__icon v-input__icon--clear">
                <button
                  type="button"
                  aria-label="clear icon"
                  class="v-icon notranslate v-icon--link mdi mdi-close theme--light"
                  @click="removeFile"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </label>
  </image-uploader>
</template>

<script>
import ImageUploader from 'vue-image-upload-resize'
export default {
  components: {
    ImageUploader,
  },
  name: 'ImageResizeInput',
  props: ['value'],
  data: () => ({
    filename: '',
  }),
  mounted() {
    if (this.value) {
      this.filename = this.value
    }
  },
  methods: {
    setImage(file) {
      this.filename = file.info.name
      this.$emit('input', file)
    },
    removeFile(e) {
      e.preventDefault()
      e.stopPropagation()
      this.filename = ''
      document.getElementById('fileInput').value = ''
      this.$emit('input', null)
    },
  },
}
</script>

<style>
#fileInput {
  display: none;
}
</style>
