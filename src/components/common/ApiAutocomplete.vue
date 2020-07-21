<template>
  <v-autocomplete
    :value="value"
    @input="handleChange"
    :items="items"
    :loading="isLoading"
    :search-input.sync="search"
    :multiple="multiple"
    :chips="chips"
    hide-no-data
    hide-selected
    :item-text="itemText"
    :item-value="itemValue"
    :label="label"
    :placeholder="placeholder"
    return-object
  ></v-autocomplete>
</template>
<script>
import { debounce, unionBy } from 'lodash'

export default {
  props: {
    api: {
      type: Function,
    },
    value: {
      type: null,
    },
    itemText: {
      type: String,
    },
    itemValue: {
      type: String,
    },
    multiple: {
      type: Boolean,
    },
    chips: {
      type: Boolean,
    },
    label: {
      type: String,
    },
    placeholder: {
      type: String,
    },
  },
  data() {
    return {
      search: null,
      isLoading: false,
      items: [],
    }
  },
  methods: {
    async _fetchItems(inputVal) {
      if (!inputVal) {
        return
      }

      this.isLoading = true
      this.api(inputVal)
        .then((items) => {
          this.items = unionBy(this.items, items, this.itemValue)
          this.isLoading = false
        })
        .catch(() => {
          this.isLoading = false
        })
    },
    handleChange(val) {
      this.$emit('input', val)
    },
    syncValue(val) {
      if (val) {
        if (this.multiple) {
          this.items = unionBy(this.items, val, this.itemValue)
        } else {
          this.items = unionBy(this.items, [val], this.itemValue)
        }
      }
    },
  },
  watch: {
    search(val) {
      this.fetchItems(val)
    },
    value(val) {
      this.syncValue(val)
    },
  },
  created() {
    this.fetchItems = debounce(this._fetchItems, 400)
    this.syncValue(this.value)
  },
}
</script>
