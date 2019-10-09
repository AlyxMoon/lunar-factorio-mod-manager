<template>
  <div class="page-portal">
    <div class="grid col-2 row-1">
      <div>
        <div class="menu">
          <div class="menu-section">
            <select @change="setCurrentOnlineModFilter($event.target.value); $event.target.blur()">
              <option
                v-for="(category, index) in onlineModCategories"
                :key="index"
                :selected="category.name === onlineModsCurrentFilter"
                :value="category.name"
              >
                {{ category.title }}
              </option>
            </select>

            <select @change="setCurrentOnlineModSort($event.target.value); $event.target.blur()">
              <option
                v-for="(sort, index) in onlineModSorts"
                :key="index"
                :selected="sort.name === onlineModsCurrentSort"
                :value="sort.name"
              >
                {{ sort.title }}
              </option>
            </select>
          </div>

          <div class="menu-section">
            <input type="search" placeholder="Search..." class="search-mods" @change="setOnlineQuery($event.target.value); $event.target.focus()" />
            <button
              @click="fetchOnlineMods(true)"
              class="btn"
              title="Refresh mod list. Please don't overuse this! The mods will normally be cached for a full day before automatically refreshing. This forces a check of the Factorio mod portal."
            >
              <i class="fa fa-sync" />
            </button>
          </div>
        </div>

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
      onlineModCategories: state => state.onlineModCategories,
      onlineModSorts: state => state.onlineModSorts,
      onlineModsPage: state => state.onlineModsPage,
      onlineModsCurrentFilter: state => state.onlineModsCurrentFilter,
      onlineModsCurrentSort: state => state.onlineModsCurrentSort,
      username: state => state.username,
      onlineQuery: state => state.onlineQuery,
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
      'setCurrentOnlineModFilter',
      'setCurrentOnlineModSort',
      'setOnlineQuery',
    ]),
  },
}
</script>

<style lang="scss" scoped>
 .search-mods {
     margin-right: 15px;
 }
</style>
