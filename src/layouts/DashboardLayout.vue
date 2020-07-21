<template>
  <v-app id="app">
    <v-navigation-drawer v-model="drawer" :mini-variant="miniDrawer" app>
      <v-img :src="require('../assets/logo.png')" contain height="75" />

      <v-list dense>
        <v-list-item
          link
          v-for="(link, index) in links"
          v-bind:key="'link' + index"
          :to="link.path"
        >
          <v-list-item-action>
            <v-icon>{{ link.meta.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ link.meta.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click.stop="miniDrawer = !miniDrawer" />
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu bottom left :offset-y="true">
        <template v-slot:activator="{ on }">
          <v-btn dark icon v-on="on">
            <v-icon>mdi-account-circle-outline</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item v-bind:key="'dropdown'" :to="'/my-account'">
            <v-list-item-title>My Account</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <v-row>
          <v-col class="text-center">
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-footer color="primary" app inset>
      <span class="white--text">&copy; 2020</span>
    </v-footer>
  </v-app>
</template>

<style>
#app {
  background: #f4f5f7;
}
#app nav {
  top: 66px !important;
}
#app header {
  left: 0 !important;
}
</style>

<script>
import AuthHelper from '@/helpers/AuthHelper'
export default {
  data: () => ({
    drawer: null,
    miniDrawer: true,
  }),
  computed: {
    title() {
      return this.$route.meta.title
    },
    links() {
      const loggedIn = AuthHelper.loggedIn()
      return this.$router.options.routes.filter((r) => {
        const { meta } = r
        const authorized =
          meta && meta.authorize
            ? (loggedIn.roles || []).some((item) =>
                meta.authorize.includes(item)
              )
            : true

        return (
          meta !== undefined &&
          meta.isMenuItem &&
          authorized &&
          (meta.layout == 'simple' || meta.layout == this.$route.meta.layout)
        )
      })
    },
  },
  watch: {
    miniDrawer(val) {
      if (this.$vuetify.breakpoint.name == 'xs') {
        this.miniDrawer = false
        this.drawer = !val
      } else {
        this.drawer = true
        this.miniDrawer = val
      }
    },
  },
}
</script>
