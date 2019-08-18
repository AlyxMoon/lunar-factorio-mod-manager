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
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'ModInfoPanel',
  computed: {
    ...mapState({
      mod: state => state.selectedMod,
    }),
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
