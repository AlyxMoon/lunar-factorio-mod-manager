<template>
  <div class="mod-info-panel">
    <div class="menu">
      <div>
        <span class="menu-label">{{ mod ? mod.title : 'Selected Mod Info' }}</span>
      </div>
    </div>
    <div
      v-if="mod"
      class="mod-info-content"
    >
      <hr>
      <div>
        <div class="mod-description">
          {{ mod.description }}
        </div>
      </div>
      <table>
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

      <table class="mt-1">
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
            <tr v-for="(dependency, index) of filterModDependenciesByType(mod, type)">
              <td
                v-if="index === 0"
                :rowspan="filterModDependenciesByType(mod, type).length"
              >
                {{ type }}
              </td>
              <td :colspan="dependency.version ? '1' : '2'">
                {{ dependency.name }}
              </td>
              <td v-if="dependency.version">
                {{ dependency.operator }} {{ dependency.version }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
  name: 'ModInfoPanel',
  computed: {
    ...mapState({
      mod: state => state.selectedMod,
    }),
    ...mapGetters(['filterModDependenciesByType']),
  },
}
</script>

<style lang="scss" scoped>
div.mod-info-panel {
  background-color: $background-secondary-color;
  border: 5px solid $background-primary-color;
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
