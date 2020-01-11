<template>
  <PanelContainer>
    <PanelMenu>
      <template v-slot:menu-left>
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
      </template>

      <template v-slot:menu-right>
        <button
          @click="fetchOnlineMods(true)"
          class="btn"
          title="Refresh mod list. Please don't overuse this! The mods will normally be cached for a full day before automatically refreshing. This forces a check of the Factorio mod portal."
        >
          <i class="fa fa-sync" />
        </button>

        <input
          @search="setOnlineQuery($event.target.value);"
          type="search"
          placeholder="Search..."
          class="search-mods"
        >
      </template>
    </PanelMenu>
    <PanelContent class="full">
      <table v-if="currentlyDisplayedOnlineMods">
        <tbody>
          <tr
            v-for="mod in currentlyDisplayedOnlineMods"
            @click="selectOnlineMod(mod)"
            :class="{ selected: mod.name === selectedOnlineMod.name }"
          >
            <td>
              <i
                v-if="isModDownloaded(mod.name)"
                class="fa fa-check"
                title="Already Downloaded"
              />
              {{ mod.title }}
            </td>
          </tr>
        </tbody>
      </table>
    </PanelContent>

    <PanelMenu
      class="compact"
      position="bottom"
    >
      <template v-slot:menu-left>
        <span class="mr-1">Page {{ onlineModsPage + 1 }} of {{ maxPageOnlineMods + 1 }}</span>
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
      </template>
    </PanelMenu>

    <PanelMenu
      :border="false"
      class="compact"
    >
      <template v-slot:menu-left>
        Results: {{ onlineModsCount }}
      </template>

      <template v-slot:menu-right>
        <span v-if="username">Logged In As: {{ username }}</span>
        <span v-else>Player is not logged in</span>
      </template>
    </PanelMenu>
  </PanelContainer>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import PanelMenu from './partials/PanelMenu'
import PanelContent from './partials/PanelContent'
import PanelContainer from './partials/PanelContainer'

export default {
  name: 'OnlineModsList',
  components: { PanelContainer, PanelContent, PanelMenu },
  computed: {
    ...mapState({
      onlineModCategories: state => state.onlineModCategories,
      onlineModSorts: state => state.onlineModSorts,
      onlineModsPage: state => state.onlineModsPage,
      onlineModsCurrentFilter: state => state.onlineModsCurrentFilter,
      onlineModsCurrentSort: state => state.onlineModsCurrentSort,
      onlineQuery: state => state.onlineQuery,
      selectedOnlineMod: state => state.selectedOnlineMod || {},
      username: state => state.username,
    }),
    ...mapGetters([
      'currentlyDisplayedOnlineMods',
      'isModDownloaded',
      'maxPageOnlineMods',
      'onlineModsCount',
    ]),
  },
  methods: {
    ...mapActions([
      'decrementCurrentOnlineModsPage',
      'incrementCurrentOnlineModsPage',
      'goToFirstOnlineModsPage',
      'goToLastOnlineModsPage',
      'fetchOnlineMods',
      'selectOnlineMod',
      'setCurrentOnlineModFilter',
      'setCurrentOnlineModSort',
      'setOnlineQuery',
    ]),
  },
}
</script>
