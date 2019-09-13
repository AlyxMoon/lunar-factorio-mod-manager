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
          :disabled="isModDownloaded(mod.name)"
          :title="isModDownloaded(mod.name) ? 'Mod is already downloaded' : 'Download Latest Mod Version'"
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
      <table>
        <tbody>
          <tr>
            <th>Version</th>
            <td>{{ mod.latest_release.version }}</td>
          </tr>
          <tr>
            <th>Factorio Version</th>
            <td>{{ mod.latest_release.info_json.factorio_version }}</td>
          </tr>
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
    ...mapGetters(['isModDownloaded']),
  },
  methods: {
    ...mapActions(['downloadMod']),
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
  padding: 0 10px;

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
