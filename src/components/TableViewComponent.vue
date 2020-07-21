<template>
  <v-card>
    <v-container class="bot-border">
      <v-img :src="require('../assets/logo.png')" contain height="120" />
    </v-container>
    <v-card-title>
      {{ title }}
      <v-btn
        text
        small
        @click="show = !show"
        class="filter-btn"
        v-if="filterFields && filterFields.length > 0"
      >
        Filters
        <v-icon right>{{
          show ? 'mdi-chevron-up' : 'mdi-chevron-down'
        }}</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        @input="handleSearch"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-expand-transition>
      <v-row class="filter-block" v-if="show">
        <v-col
          cols="12"
          md="6"
          lg="6"
          v-for="(item, index) in filterOptions"
          :key="'filter-block-' + index"
        >
          <div class="filter-block-title">{{ filterFields[index] }}</div>
          <v-select
            v-model="filterSelection[index]"
            chips
            multiple
            deletable-chips
            small-chips
            hide-details
            :items="item"
            item-text="label"
            item-value="value"
            @input="handleFilter"
          ></v-select>
        </v-col>
      </v-row>
    </v-expand-transition>
    <v-data-table
      :expanded="expanded"
      :single-expand="singleExpand"
      :show-expand="showExpand"
      :headers="headers"
      :items="items"
      :item-key="itemKey"
      :loading="loading"
      :options="options"
      :footer-props="{
        itemsPerPageOptions: [10, 20, 50, 100],
      }"
      @update:options="updateOptions"
      :server-items-length="totalCount"
      loading-text="Loading... Please wait"
      class="elevation-1"
      calculate-widths
    >
      <template
        v-for="(_, name) in $scopedSlots"
        :slot="name"
        slot-scope="slotData"
      >
        <slot :name="name" v-bind="slotData" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { debounce } from 'lodash'

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    headers: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
    },
    options: {
      type: Object,
    },
    totalCount: {
      type: Number,
    },
    filterFields: {
      type: Array,
    },
    filterOptions: {
      type: Array,
    },
    itemKey: {
      type: String,
      default: '_id.$oid',
    },
    expanded: {
      type: Array,
    },
    singleExpand: {
      type: Boolean,
    },
    showExpand: {
      type: Boolean,
    },
  },
  data() {
    return {
      search: '',
      show: false,
      filterSelection: this.filterFields
        ? this.filterFields.map((_, index) =>
            this.filterOptions[index].map((item) => item.value)
          )
        : [],
    }
  },
  methods: {
    _handleSearch(val) {
      this.$emit('search', val)
    },
    updateOptions(val) {
      this.$emit('update:options', val)
    },
    updateFilters() {
      this.$emit('filter', this.filterSelection)
    },
  },
  created() {
    this.handleSearch = debounce(this._handleSearch, 400)
    this.handleFilter = debounce(this.updateFilters, 1000)
  },
}
</script>

<style lang="scss">
.filter-btn {
  margin-left: 8px;
  margin-top: 4px;
}
.filter-block {
  text-align: left;
  margin: 4px;
}
.filter-block-title {
  text-transform: capitalize;
  font-size: 16px;
}
</style>
