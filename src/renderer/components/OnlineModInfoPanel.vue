<template>
  <div
    v-if="mod"
    class="mod-info-panel"
  >
    <div class="menu">
      <div>
        <span class="menu-label">{{ mod ? mod.title : 'Selected Mod Info' }}</span>
      </div>
      <div>
        <button
          @click="downloadMod(mod)"
          :disabled="isModDownloaded(mod.name) && !isModUpdateAvailable(mod.name)"
          :title="isModDownloaded(mod.name) ? (isModUpdateAvailable(mod.name) ? 'Download Update' : 'Mod is already downloaded') : 'Download Latest Mod Version'"
          class="btn"
        >
          <i class="fa fa-download" />
        </button>
      </div>
    </div>

    <div class="mod-info-content">
      <hr>
      <div>
        <div class="mod-description">
          {{ mod.summary }}
        </div>
        <div
          v-if="mod.thumbnail && mod.thumbnail !== '/assets/.thumb.png'"
          class="mod-image"
        >
          <img :src="'https://mods-data.factorio.com' + mod.thumbnail">
        </div>
      </div>

      <h3 class="mt-2">
        Mod Info
      </h3>
      <hr class="compact">

      <table>
        <tbody>
          <tr>
            <th>Author</th>
            <td>{{ mod.owner }}</td>
          </tr>
          <tr>
            <th>Category</th>
            <td>{{ mod.category }}</td>
          </tr>
          <tr>
            <th>Downloads</th>
            <td>{{ mod.downloads_count }}</td>
          </tr>
        </tbody>
      </table>

      <h3 class="mt-2">
        Releases
      </h3>
      <hr class="compact">
      <template v-if="mod && mod.releases">
        <table>
          <thead>
            <tr>
              <th class="cell-check" />
              <th>Version</th>
              <th>Game Version</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="release in mod.releases.slice().reverse()">
              <td class="cell-check">
                <button
                  @click="downloadModRelease({ mod, release })"
                  class="btn"
                  title="Download this release"
                >
                  <i class="fa fa-download" />
                </button>
              </td>
              <td>{{ release.version }}</td>
              <td>{{ release.info_json.factorio_version }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <i class="fa fa-cog fa-spin" /> Fetching data
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  name: 'ModInfoPanel',
  computed: {
    ...mapState({
      mod: state => state.selectedOnlineMod,
    }),
    ...mapGetters(['isModDownloaded', 'isModUpdateAvailable']),
  },
  methods: {
    ...mapActions(['downloadMod', 'downloadModRelease']),
  },
}
</script>

<style lang="scss" scoped>
div.mod-info-panel {
  background-color: $background-secondary-color;
  border: 5px solid $background-primary-color;
  height: 100%;
  box-sizing: border-box;
}

div.mod-info-content {
  height: calc(100% - 40px);
  padding: 10px;

  overflow-y: auto;

  & > div {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
  }
}

table {
  tbody {
    tr {
      &:hover {
        background-color: $background-primary-color;
      }
    }
  }
}
</style>
