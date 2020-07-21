<template>
  <div class="locale-changer">
    <v-select
      v-model="$i18n.locale"
      :items="langs"
      label="Language"
      dense
    ></v-select>
  </div>
</template>

<script>
export default {
  name: 'locale-changer',
  data() {
    return { langs: ['en', 'es'] }
  },
}
</script>
