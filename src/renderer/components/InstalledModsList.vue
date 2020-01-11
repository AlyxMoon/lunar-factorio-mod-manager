<template>
  <div class="installed-mods-list">
    <div class="menu">
      <div>
        <span class="menu-label">Available Mods</span>
      </div>
    </div>

    <table v-if="installedMods">
      <thead>
        <tr>
          <th class="cell-check" />
          <th>Name</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="mod in installedMods"
          :class="{ selected: mod.name === selectedMod.name }"
        >
          <td class="cell-check">
            <button
              @click="addModToCurrentProfile(mod)"
              :disabled="isModInCurrentProfile(mod)"
              class="btn green"
            >
              <i class="fa fa-plus" />
            </button>
          </td>
          <td @click="selectInstalledMod(mod.name)">
            <i
              v-if="isModUpdateAvailable(mod.name)"
              class="fa fa-arrow-up"
              title="Update available!"
            />
            <i
              v-if="mod.hasMissingRequiredDependencies"
              class="fa fa-exclamation-circle"
              title="There are required dependencies not installed!"
            />
            {{ mod.title }}
          </td>
          <td @click="selectInstalledMod(mod.name)">
            {{ mod.version }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'InstalledModsList',
  computed: {
    ...mapState({
      installedMods: state => state.installedMods,
      selectedMod: state => state.selectedMod || {},
    }),
    ...mapGetters(['isModUpdateAvailable', 'isModInCurrentProfile']),
  },
  methods: {
    ...mapActions(['addModToCurrentProfile', 'selectInstalledMod']),
  },
}
</script>

<style>
.installed-mods-list {
  overflow-y: auto;
}
</style>
