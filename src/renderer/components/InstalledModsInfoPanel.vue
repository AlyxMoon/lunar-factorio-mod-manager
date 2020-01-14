<template>
  <div class="mod-info-panel">
    <PanelMenu>
      <template v-slot:menu-left>
        {{ mod ? mod.title : 'Selected Mod Info' }}
      </template>
      <template v-slot:menu-right>
        <div v-if="mod">
          <button
            v-if="isModUpdateAvailable(mod.name)"
            class="btn"
            title="Download Mod Update"
            @click="downloadMod(getOnlineInfoForMod(mod))"
          >
            <i class="fa fa-arrow-up" />
          </button>
          <button
            v-if="mod.hasMissingRequiredDependencies"
            class="btn"
            title="Download Missing Required Dependencies"
            @click="downloadMissingDependenciesForMod(mod)"
          >
            <i class="fa fa-exclamation-circle" />
          </button>
          <button
            v-if="mod.name !== 'base'"
            class="btn red"
            title="Delete Mod"
            @click="deleteMod(mod.name)"
          >
            <i class="fa fa-trash-alt" />
          </button>
        </div>
      </template>
    </PanelMenu>

    <PanelContent v-if="mod">
      <hr>

      <div class="mod-description mb-2">
        {{ mod.description }}
      </div>

      <table class="no-hover">
        <tbody>
          <tr>
            <th>Version</th>
            <td>{{ mod.version }}</td>
          </tr>
          <tr>
            <th>Factorio Version</th>
            <td>{{ mod.factorio_version }}</td>
          </tr>
          <tr>
            <th>Author</th>
            <td>{{ mod.author }}</td>
          </tr>
        </tbody>
      </table>

      <table class="no-hover mt-1">
        <thead>
          <tr>
            <th
              colspan="3"
              class="text-align-center"
            >
              Dependencies
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="type of ['required', 'optional', 'incompatible']">
            <tr
              v-for="(dependency, index) of filterModDependenciesByType(mod, type)"
              :key="'dependency-' + index"
            >
              <td
                v-if="index === 0"
                :rowspan="filterModDependenciesByType(mod, type).length"
              >
                {{ type }}
              </td>
              <td :colspan="dependency.version ? '1' : '2'">
                <i
                  v-if="!dependency.installed"
                  class="fa fa-exclamation-circle"
                  title="This dependency is not installed!"
                />
                {{ dependency.name }}
              </td>
              <td v-if="dependency.version">
                {{ dependency.operator }} {{ dependency.version }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </PanelContent>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import PanelMenu from './partials/PanelMenu'
import PanelContent from './partials/PanelContent'

export default {
  name: 'InstalledModsInfoPanel',
  components: { PanelContent, PanelMenu },
  computed: {
    ...mapState({
      mod: state => state.selectedMod,
    }),
    ...mapGetters(['filterModDependenciesByType', 'getOnlineInfoForMod', 'isModUpdateAvailable']),
  },
  methods: {
    ...mapActions(['deleteMod', 'downloadMod', 'downloadMissingDependenciesForMod']),
  },
}
</script>

<style lang="scss" scoped>
div.mod-info-panel {
  background-color: $background-secondary-color;
  border: 5px solid $background-primary-color;

  height: 100%;
  display: flex;
  flex-direction: column;
}

div.mod-info-content {
  height: calc(100% - 40px);
  padding: 5px 10px;

  overflow-y: auto;

  & > div {
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
  }
}
</style>
