<template>
  <div class="page-portal">
    <div class="grid col-2 row-1">
      <div>
        <div class="menu">
          <div class="menu-section">
            <span
              v-if="username"
              class="menu-label"
            >Logged In As: {{ username }}</span>
            <span
              v-else
              class="menu-label"
            >Player is not logged in</span>
          </div>
          <div class="menu-section">
            <button
              @click="fetchOnlineMods(true)"
              class="btn"
              title="Refresh mod list. Please don't overuse this! The mods will normally be cached for a full day before automatically refreshing. This forces a check of the Factorio mod portal."
            >
              <i class="fa fa-sync" />
            </button>
          </div>
        </div>
        <OnlineModsList />
        <div class="menu">
          <span class="menu-label">Results: {{ numMods }}</span>
          <span class="menu-label">Page {{ onlineModsPage + 1 }} of {{ maxPageOnlineMods + 1 }}</span>
          <div>
            <button
              :disabled="onlineModsPage <= 0"
              @click="goToFirstOnlineModsPage()"
              class="btn"
            >
              <i class="fa fa-angle-double-left" />
            </button>
            <button
              :disabled="onlineModsPage <= 0"
              @click="decrementCurrentOnlineModsPage()"
              class="btn"
            >
              <i class="fa fa-chevron-left" />
            </button>
            <button
              :disabled="onlineModsPage >= maxPageOnlineMods"
              @click="incrementCurrentOnlineModsPage()"
              class="btn"
            >
              <i class="fa fa-chevron-right" />
            </button>
            <button
              :disabled="onlineModsPage >= maxPageOnlineMods"
              @click="goToLastOnlineModsPage()"
              class="btn"
            >
              <i class="fa fa-angle-double-right" />
            </button>
          </div>
        </div>
      </div>
      <div>
        <OnlineModInfoPanel />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import OnlineModInfoPanel from '@/components/OnlineModInfoPanel'
import OnlineModsList from '@/components/OnlineModsList'

export default {
  name: 'Portal',
  components: {
    OnlineModInfoPanel,
    OnlineModsList,
  },
  computed: {
    ...mapState({
      numMods: state => (state.onlineMods && state.onlineMods.length) || 0,
      onlineModsPage: state => state.onlineModsPage,
      username: state => state.username,
    }),
    ...mapGetters(['maxPageOnlineMods']),
  },
  created () {
    this.fetchOnlineMods()
  },
  methods: {
    ...mapActions([
      'decrementCurrentOnlineModsPage',
      'incrementCurrentOnlineModsPage',
      'goToFirstOnlineModsPage',
      'goToLastOnlineModsPage',
      'fetchOnlineMods',
    ]),
  },
}
</script>

<style lang="scss" scoped></style>
